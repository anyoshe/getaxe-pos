import { Repository } from "@/repositories/base";

import { SalesUnitOfWork } from "./unit-of-work";
import { salesValidator } from "./sales-validator";
import { salesStockAllocationService } from "./sales-stock-allocation.service";
import { paymentService } from "./payment.service";

import type { CreateSaleRequest } from "../types";

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
      const { serialNumbers, skipStock, ...itemData } = item as typeof item & {
        skipStock?: boolean;
      };

      const serials = (serialNumbers ?? [])
        .map((s) => s.trim())
        .filter(Boolean);

      if (serials.length > 0) {
        if (serials.length !== itemData.quantity) {
          throw new Error(
            `Expected ${itemData.quantity} serial number(s) for product line.`,
          );
        }
        if (new Set(serials).size !== serials.length) {
          throw new Error("Duplicate serial numbers on a sale line.");
        }
      }

      const saleItem = await uow.saleItems.create({
        ...itemData,
        saleId: sale.id,
        businessId: sale.businessId,
      });

      if (!skipStock) {
        const allocations = await salesStockAllocationService.allocate(uow, {
          businessId: sale.businessId,
          productId: saleItem.productId,
          warehouseId: sale.warehouseId,
          quantity: saleItem.quantity,
          saleItemId: saleItem.id,
        });

        for (const allocation of allocations) {
          // Balance is source of truth — lock and decrease by balance id
          const locked = await uow.balances.findByIdForUpdate(
            allocation.balanceId,
          );

          if (!locked || locked.quantity < allocation.quantity) {
            throw new Error(
              "Stock changed during sale — refresh and try again.",
            );
          }

          await uow.balances.decreaseQuantity(
            allocation.balanceId,
            allocation.quantity,
          );

          if (allocation.batchId) {
            await uow.batches.decreaseQuantity(
              allocation.batchId,
              sale.businessId,
              allocation.quantity,
            );
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
      }

      if (serials.length > 0) {
        await uow.serials.markSold(
          sale.businessId,
          serials,
          sale.invoiceNumber,
        );
      }

      items.push(saleItem);
    }

    // Payment ledger is optional for POS: sale already carries amountPaid / paymentStatus.
    // Inserting into `payments` fails when that table/enum is out of sync with the schema.
    let paymentResult = {
      sale,
      payments: [] as Awaited<
        ReturnType<typeof paymentService.recordPayments>
      >["payments"],
    };

    if (request.payments.length > 0) {
      try {
        paymentResult = await paymentService.recordPayments(
          uow,
          sale.id,
          request.payments,
        );
      } catch (err) {
        // Keep the sale successful; amounts are already on the sales row.
        console.error(
          "[sales] payment ledger insert skipped:",
          err instanceof Error ? err.message : err,
        );
        paymentResult = { sale, payments: [] };
      }
    }

    return {
      sale: paymentResult.sale,
      items,
      payments: paymentResult.payments,
    };
  }
}

export const salesService = new SalesService();
