import { SalesUnitOfWork } from "./unit-of-work";

export interface RestoreStockRequest {
  productId: string;

  batchId: string;

  warehouseId: string;

  businessId: string;

  quantity: number;

  userId: string;

  reference: string;
  serialNumbers?: string[];
}

export class SalesStockReturnService {
  async restore(uow: SalesUnitOfWork, request: RestoreStockRequest) {
    const batch = await uow.batches.findById(
      request.batchId,
      request.businessId,
    );

    if (!batch) {
      throw new Error("Stock batch not found.");
    }

    if (batch.product?.serialized) {
      if (
        !request.serialNumbers ||
        request.serialNumbers.length !== request.quantity
      ) {
        throw new Error(
          "Serialized returns require one serial number per returned unit.",
        );
      }

      const serials = await uow.serials.findBySerialNumbersForUpdate(
        request.businessId,
        request.serialNumbers,
      );

      if (serials.length !== request.serialNumbers.length) {
        throw new Error("One or more returned serial numbers were not found.");
      }

      for (const serial of serials) {
        if (
          serial.productId !== request.productId ||
          serial.batchId !== request.batchId ||
          serial.status !== "SOLD"
        ) {
          throw new Error("A returned serial number is not eligible for return.");
        }
      }

      for (const serial of serials) {
        await uow.serials.moveWarehouse(serial.id, request.warehouseId);
        await uow.serials.updateStatus(serial.id, "RETURNED");
      }
    }

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

        quantity: request.quantity,
      });
    } else {
      await uow.balances.increaseQuantity(balance.id, request.quantity);
    }

    await uow.batches.increaseQuantity(
      request.batchId,
      request.businessId,
      request.quantity,
    );

    await uow.movements.create({
      businessId: request.businessId,

      productId: request.productId,

      batchId: request.batchId,

      warehouseId: request.warehouseId,

      userId: request.userId,

      movementType: "SALE_RETURN",

      quantity: request.quantity,

      reference: request.reference,

      notes: "Sale return",
    });
  }
}

export const salesStockReturnService = new SalesStockReturnService();
