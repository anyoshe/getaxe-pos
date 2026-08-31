import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  inventoryBalances,
  products,
  productBatches,
  stockCountItems,
  stockCounts,
  warehouses,
} from "@/db/schema";

export class StockCountsRepository {
  async list(businessId: string) {
    return db
      .select({
        id: stockCounts.id,
        status: stockCounts.status,
        reference: stockCounts.reference,
        notes: stockCounts.notes,
        warehouseId: stockCounts.warehouseId,
        warehouseName: warehouses.name,
        startedAt: stockCounts.startedAt,
        completedAt: stockCounts.completedAt,
        itemCount: sql<number>`(
          SELECT COUNT(*)::int FROM stock_count_items sci
          WHERE sci.stock_count_id = ${stockCounts.id}
        )`,
      })
      .from(stockCounts)
      .innerJoin(warehouses, eq(warehouses.id, stockCounts.warehouseId))
      .where(eq(stockCounts.businessId, businessId))
      .orderBy(desc(stockCounts.createdAt));
  }

  async findById(id: string, businessId: string) {
    const [row] = await db
      .select({
        id: stockCounts.id,
        businessId: stockCounts.businessId,
        warehouseId: stockCounts.warehouseId,
        warehouseName: warehouses.name,
        status: stockCounts.status,
        reference: stockCounts.reference,
        notes: stockCounts.notes,
        countedBy: stockCounts.countedBy,
        startedAt: stockCounts.startedAt,
        completedAt: stockCounts.completedAt,
      })
      .from(stockCounts)
      .innerJoin(warehouses, eq(warehouses.id, stockCounts.warehouseId))
      .where(
        and(eq(stockCounts.id, id), eq(stockCounts.businessId, businessId)),
      )
      .limit(1);
    return row ?? null;
  }

  async listItems(stockCountId: string, businessId: string) {
    return db
      .select({
        id: stockCountItems.id,
        productId: stockCountItems.productId,
        productName: products.name,
        productSku: products.sku,
        batchId: stockCountItems.batchId,
        batchNumber: productBatches.batchNumber,
        systemQuantity: stockCountItems.systemQuantity,
        countedQuantity: stockCountItems.countedQuantity,
        notes: stockCountItems.notes,
      })
      .from(stockCountItems)
      .innerJoin(products, eq(products.id, stockCountItems.productId))
      .leftJoin(
        productBatches,
        eq(productBatches.id, stockCountItems.batchId),
      )
      .where(
        and(
          eq(stockCountItems.stockCountId, stockCountId),
          eq(stockCountItems.businessId, businessId),
        ),
      )
      .orderBy(products.name);
  }

  /** Snapshot balances for a warehouse into count lines. */
  async snapshotBalances(businessId: string, warehouseId: string) {
    return db
      .select({
        productId: inventoryBalances.productId,
        batchId: inventoryBalances.batchId,
        quantity: inventoryBalances.quantity,
      })
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.businessId, businessId),
          eq(inventoryBalances.warehouseId, warehouseId),
        ),
      );
  }

  async create(
    data: {
      businessId: string;
      warehouseId: string;
      reference: string | null;
      notes: string | null;
      countedBy: string | null;
    },
    lines: Array<{
      productId: string;
      batchId: string | null;
      systemQuantity: string;
    }>,
  ) {
    return db.transaction(async (tx) => {
      const [count] = await tx
        .insert(stockCounts)
        .values({
          businessId: data.businessId,
          warehouseId: data.warehouseId,
          status: "IN_PROGRESS",
          reference: data.reference,
          notes: data.notes,
          countedBy: data.countedBy,
        })
        .returning();

      if (lines.length > 0) {
        await tx.insert(stockCountItems).values(
          lines.map((l) => ({
            businessId: data.businessId,
            stockCountId: count.id,
            productId: l.productId,
            batchId: l.batchId,
            systemQuantity: l.systemQuantity,
            countedQuantity: null,
          })),
        );
      }

      return count;
    });
  }

  async updateItemCounted(
    itemId: string,
    businessId: string,
    countedQuantity: string | null,
    notes?: string | null,
  ) {
    const [row] = await db
      .update(stockCountItems)
      .set({
        countedQuantity,
        notes: notes === undefined ? undefined : notes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(stockCountItems.id, itemId),
          eq(stockCountItems.businessId, businessId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async setStatus(
    id: string,
    businessId: string,
    status: string,
    completedAt?: Date | null,
  ) {
    const [row] = await db
      .update(stockCounts)
      .set({
        status,
        completedAt: completedAt ?? undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(stockCounts.id, id), eq(stockCounts.businessId, businessId)))
      .returning();
    return row ?? null;
  }
}

export const stockCountsRepository = new StockCountsRepository();
