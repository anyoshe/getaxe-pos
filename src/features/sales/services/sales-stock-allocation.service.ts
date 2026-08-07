import { SalesUnitOfWork } from "./unit-of-work";

export interface AllocatedBatch {
  batchId: string;

  warehouseId: string;

  quantity: number;
}

export interface AllocateStockRequest {
  businessId: string;

  productId: string;

  warehouseId: string;

  quantity: number;

  saleItemId: string;
}

export class SalesStockAllocationService {
  async allocate(
    uow: SalesUnitOfWork,
    request: AllocateStockRequest,
  ): Promise<AllocatedBatch[]> {
    let remaining = request.quantity;

    const allocations: AllocatedBatch[] = [];

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
