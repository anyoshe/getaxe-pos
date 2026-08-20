import { Repository } from "@/repositories/base";

import { SalesUnitOfWork } from "./unit-of-work";

import { salesValidator } from "./sales-validator";

import { salesStockAllocationService } from "./sales-stock-allocation.service";

import type { CreateSaleRequest } from "../types";

import { salesStatusService } from "./sales-status.service";

import { paymentService } from "./payment.service";

export class SalesService {
  async createSale(request: CreateSaleRequest) {
    salesValidator.validateCreateSale(request);

    return Repository.withTransaction(async (tx) => {
      const uow = new SalesUnitOfWork(tx);

      return this.createSaleWithUnitOfWork(uow, request);
    });
  }

  async createSaleWithUnitOfWork(
    uow: SalesUnitOfWork,
    request: CreateSaleRequest,
  ) {
    const sale = await uow.sales.create(request.sale);

    const items = [];

    for (const item of request.items) {
      const saleItem = await uow.saleItems.create({
        ...item,

        saleId: sale.id,

        businessId: sale.businessId,
      });

      const product = await uow.products.findById(
        saleItem.productId,
        sale.businessId,
      );

      const allocations =
    await salesStockAllocationService.allocate(
        uow,
        {
            businessId: sale.businessId,
            productId: saleItem.productId,
            warehouseId: sale.warehouseId,
            quantity: saleItem.quantity,
            saleItemId: saleItem.id,
            serialized: product?.serialized === true,
        }
    );

      for (const allocation of allocations) {
        const balance = await uow.balances.findByBatchWarehouseForUpdate(
          allocation.batchId,
          allocation.warehouseId,
        );

        if (!balance) {
          throw new Error("Inventory balance not found.");
        }

        await uow.balances.decreaseQuantity(balance.id, allocation.quantity);

        await uow.batches.decreaseQuantity(
          allocation.batchId,
          sale.businessId,
          allocation.quantity,
        );

        if (allocation.serialNumbers) {
          const serials = await uow.serials.findBySerialNumbersForUpdate(
            sale.businessId,
            allocation.serialNumbers,
          );
          if (serials.length !== allocation.serialNumbers.length) {
            throw new Error("One or more serialized units could not be found.");
          }
          for (const serial of serials) {
            if (
              serial.productId !== saleItem.productId ||
              serial.batchId !== allocation.batchId ||
              serial.warehouseId !== allocation.warehouseId ||
              serial.status !== "IN_STOCK" &&
              serial.status !== "RETURNED"
            ) {
              throw new Error("A serialized unit is not available for this sale.");
            }
            await uow.serials.updateStatus(serial.id, "SOLD");
          }
        }

        await uow.movements.create({
          businessId: sale.businessId,

          productId: saleItem.productId,

          batchId: allocation.batchId,

          warehouseId: allocation.warehouseId,

          userId: sale.soldBy,

          movementType: "SALE",

          quantity: -allocation.quantity,

          reference: sale.invoiceNumber,

          notes: "Sale transaction",
        });
      }

      items.push(saleItem);
    }

    const paymentResult = await paymentService.recordPayments(
      uow,
      sale.id,
      request.payments,
    );

    return {
      sale: paymentResult.sale,

      items,

      payments: paymentResult.payments,
    };
  }
}

export const salesService = new SalesService();
