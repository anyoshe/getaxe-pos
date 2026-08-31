import { qtyStr } from "@/lib/quantity";
import { stockCountsRepository } from "@/repositories/inventory/stock-counts.repository";
import { inventoryService } from "./inventory.service";

export class CycleCountService {
  async startCount(input: {
    businessId: string;
    userId: string;
    warehouseId: string;
    reference?: string | null;
    notes?: string | null;
  }) {
    const balances = await stockCountsRepository.snapshotBalances(
      input.businessId,
      input.warehouseId,
    );

    const lines = balances.map((b) => ({
      productId: b.productId,
      batchId: b.batchId,
      systemQuantity: String(b.quantity ?? "0"),
    }));

    return stockCountsRepository.create(
      {
        businessId: input.businessId,
        warehouseId: input.warehouseId,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
        countedBy: input.userId,
      },
      lines,
    );
  }

  async saveLine(input: {
    businessId: string;
    itemId: string;
    countedQuantity: number | null;
    notes?: string | null;
  }) {
    const qty =
      input.countedQuantity == null || Number.isNaN(input.countedQuantity)
        ? null
        : qtyStr(input.countedQuantity);
    return stockCountsRepository.updateItemCounted(
      input.itemId,
      input.businessId,
      qty,
      input.notes,
    );
  }

  /**
   * Post variances as stock adjustments (counted − system) per batch line.
   */
  async completeCount(input: {
    businessId: string;
    userId: string;
    stockCountId: string;
  }) {
    const count = await stockCountsRepository.findById(
      input.stockCountId,
      input.businessId,
    );
    if (!count) throw new Error("Cycle count not found.");
    if (count.status === "COMPLETED") {
      throw new Error("This cycle count is already completed.");
    }
    if (count.status === "CANCELLED") {
      throw new Error("This cycle count was cancelled.");
    }

    const items = await stockCountsRepository.listItems(
      input.stockCountId,
      input.businessId,
    );

    const missing = items.filter(
      (i) => i.countedQuantity == null || i.countedQuantity === "",
    );
    if (missing.length > 0) {
      throw new Error(
        `${missing.length} line(s) still need a counted quantity. Enter all counts before completing.`,
      );
    }

    for (const item of items) {
      const system = Number(item.systemQuantity);
      const counted = Number(item.countedQuantity);
      const variance = counted - system;
      if (!Number.isFinite(variance) || variance === 0) continue;
      if (!item.batchId) {
        throw new Error(
          `Line for ${item.productName} has no batch — cannot post adjustment.`,
        );
      }

      await inventoryService.adjustStock({
        batchId: item.batchId,
        warehouseId: count.warehouseId,
        quantity: variance,
        movement: {
          businessId: input.businessId,
          productId: item.productId,
          warehouseId: count.warehouseId,
          userId: input.userId,
          movementType: "ADJUSTMENT",
          quantity: qtyStr(variance),
          reference: count.reference ?? `CC-${count.id.slice(0, 8)}`,
          notes: `Cycle count variance (${system} → ${counted})`,
        },
      });
    }

    await stockCountsRepository.setStatus(
      input.stockCountId,
      input.businessId,
      "COMPLETED",
      new Date(),
    );

    return { posted: items.length };
  }

  async cancelCount(businessId: string, stockCountId: string) {
    const count = await stockCountsRepository.findById(stockCountId, businessId);
    if (!count) throw new Error("Cycle count not found.");
    if (count.status === "COMPLETED") {
      throw new Error("Completed counts cannot be cancelled.");
    }
    await stockCountsRepository.setStatus(stockCountId, businessId, "CANCELLED");
  }
}

export const cycleCountService = new CycleCountService();
