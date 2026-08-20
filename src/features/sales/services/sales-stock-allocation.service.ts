import { SalesUnitOfWork } from "./unit-of-work";

export interface AllocatedBatch {
  batchId: string;

  warehouseId: string;

  quantity: number;
  serialNumbers?: string[];
}

export interface AllocateStockRequest {
  businessId: string;

  productId: string;

  warehouseId: string;

  quantity: number;

  saleItemId: string;
  serialized?: boolean;
}

export class SalesStockAllocationService {
  async allocate(
    uow: SalesUnitOfWork,
    request: AllocateStockRequest,
  ): Promise<AllocatedBatch[]> {
    let remaining = request.quantity;

    const allocations: AllocatedBatch[] = [];

    if (request.serialized) {
      const serials = await uow.serials.findInStock(
        request.businessId,
        request.productId,
        request.warehouseId,
      );

      if (serials.length < request.quantity) {
        throw new Error("Insufficient serialized stock available.");
      }

      const selected = serials.slice(0, request.quantity);
      const byBatch = new Map<string, typeof selected>();
      for (const serial of selected) {
        const current = byBatch.get(serial.batchId) ?? [];
        current.push(serial);
        byBatch.set(serial.batchId, current);
      }

      for (const [batchId, batchSerials] of byBatch) {
        await uow.saleItemBatches.create({
          saleItemId: request.saleItemId,
          productBatchId: batchId,
          quantity: batchSerials.length,
        });
        allocations.push({
          batchId,
          warehouseId: request.warehouseId,
          quantity: batchSerials.length,
          serialNumbers: batchSerials.map((serial) => serial.serialNumber),
        });
      }

      return allocations;
    }

    const batches = await uow.batches.findAvailableBatchesByWarehouse(
      request.businessId,
      request.productId,
      request.warehouseId,
    );

    if (batches.length === 0) {
      throw new Error("No stock available.");
    }

    for (const batch of batches) {
      if (remaining <= 0) {
        break;
      }

      const available = Number(batch.quantityRemaining);

      if (available <= 0) {
        continue;
      }

      const allocated = Math.min(remaining, available);

      await uow.saleItemBatches.create({
        saleItemId: request.saleItemId,

        productBatchId: batch.id,

        quantity: allocated,
      });

      allocations.push({
        batchId: batch.id,

        warehouseId: request.warehouseId,

        quantity: allocated,
      });

      remaining -= allocated;
    }

    if (remaining > 0) {
      throw new Error("Insufficient stock available for this sale.");
    }

    return allocations;
  }
}

export const salesStockAllocationService = new SalesStockAllocationService();
