import { qtyStr } from "@/lib/quantity";
import { SalesUnitOfWork } from "./unit-of-work";

export interface RestoreStockRequest {
  productId: string;
  batchId: string;
  warehouseId: string;
  businessId: string;
  quantity: number;
  userId: string;
  reference: string;
  /** Serial numbers to return to AVAILABLE (serialized products). */
  serialNumbers?: string[];
}

export class SalesStockReturnService {
  async restore(uow: SalesUnitOfWork, request: RestoreStockRequest) {
    const balance = await uow.balances.findByBatchWarehouse(
      request.batchId,
      request.warehouseId,
    );

    if (!balance) {
      await uow.balances.create({
        businessId: request.businessId,
        productId: request.productId,
        batchId: request.batchId,
        warehouseId: request.warehouseId,
        quantity: qtyStr(request.quantity),
      });
    } else {
      await uow.balances.increaseQuantity(balance.id, request.quantity);
    }

    await uow.batches.increaseQuantity(
      request.batchId,
      request.businessId,
      request.quantity,
    );

    const serials = (request.serialNumbers ?? [])
      .map((s) => s.trim())
      .filter(Boolean);

    if (serials.length > 0) {
      if (serials.length !== request.quantity) {
        throw new Error(
          `Return quantity ${request.quantity} requires ${request.quantity} serial number(s).`,
        );
      }
      await uow.serials.markAvailable(request.businessId, serials);
    }

    await uow.movements.create({
      businessId: request.businessId,
      productId: request.productId,
      batchId: request.batchId,
      warehouseId: request.warehouseId,
      userId: request.userId,
      movementType: "SALE_RETURN",
      quantity: qtyStr(request.quantity),
      reference: request.reference,
      notes: "Sale return",
    });
  }
}

export const salesStockReturnService = new SalesStockReturnService();
