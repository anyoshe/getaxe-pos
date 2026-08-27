import { SalesUnitOfWork } from "./unit-of-work";

export interface AllocatedBatch {
  balanceId: string;
  batchId: string | null;
  warehouseId: string;
  quantity: number;
}

export interface AllocateStockRequest {
  businessId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  saleItemId: string;
  /**
   * Optional preferred batch ids (FEFO still used for remainder).
   * Cashier can pick an earlier-expiring lot or a specific lot.
   */
  preferredBatchIds?: string[];
}

/**
 * Allocate sale qty from inventory_balances (source of truth).
 * Default order is FEFO (earliest expiry first). Preferred batches are taken first.
 */
export class SalesStockAllocationService {
  async allocate(
    uow: SalesUnitOfWork,
    request: AllocateStockRequest,
  ): Promise<AllocatedBatch[]> {
    let remaining = request.quantity;
    const allocations: AllocatedBatch[] = [];

    const rows = await uow.balances.findForSaleAllocation(
      request.businessId,
      request.productId,
      request.warehouseId,
    );

    if (rows.length === 0) {
      throw new Error(
        "No stock available in the selected warehouse. Open Stock on Hand, confirm the product and warehouse match the POS warehouse, then try again.",
      );
    }

    const preferred = new Set(
      (request.preferredBatchIds ?? []).filter(Boolean),
    );

    // Preferred batches first (in cashier order), then remaining FEFO rows
    const ordered = [
      ...rows.filter((r) => r.batchId && preferred.has(r.batchId)),
      ...rows.filter((r) => !r.batchId || !preferred.has(r.batchId)),
    ];

    for (const row of ordered) {
      if (remaining <= 0) break;

      const available = Number(row.quantity);
      if (available <= 0) continue;

      const allocated = Math.min(remaining, available);

      if (row.batchId) {
        await uow.saleItemBatches.create({
          saleItemId: request.saleItemId,
          productBatchId: row.batchId,
          quantity: allocated,
        });
      }

      allocations.push({
        balanceId: row.balanceId,
        batchId: row.batchId,
        warehouseId: request.warehouseId,
        quantity: allocated,
      });

      remaining -= allocated;
    }

    if (remaining > 0) {
      const onHand = allocations.reduce((s, a) => s + a.quantity, 0);
      throw new Error(
        `Insufficient stock in this warehouse (need ${request.quantity}, available ${onHand}).`,
      );
    }

    return allocations;
  }
}

export const salesStockAllocationService = new SalesStockAllocationService();
