import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";

import {
  inventoryBalances,
  products,
  warehouses,
} from "@/db/schema";

export interface LowStockFilters {
  businessId: string;
  warehouseId?: string;
}

export type LowStockRow = {
  productId: string;
  productName: string;
  sku: string | null;
  warehouseId: string | null;
  warehouseName: string | null;
  currentQuantity: number;
  reorderLevel: number | null;
  minimumStock: number | null;
};

/**
 * Products at or below reorder level.
 *
 * Rules (canonical for dashboard card + attention + inventory):
 * - active, trackInventory, reorderLevel > 0
 * - Without warehouseId: compare **total on-hand across all warehouses** to reorderLevel
 * - With warehouseId: compare quantity in that warehouse only
 *
 * Returns one row per product (not one per warehouse) so counts stay consistent.
 */
export async function getLowStockProducts(
  filters: LowStockFilters,
): Promise<LowStockRow[]> {
  if (filters.warehouseId) {
    const rows = await db
      .select({
        productId: products.id,
        productName: products.name,
        sku: products.sku,
        warehouseId: warehouses.id,
        warehouseName: warehouses.name,
        currentQuantity: sql<number>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
        reorderLevel: products.reorderLevel,
        minimumStock: products.minimumStock,
      })
      .from(products)
      .leftJoin(
        inventoryBalances,
        and(
          eq(inventoryBalances.productId, products.id),
          eq(inventoryBalances.businessId, filters.businessId),
          eq(inventoryBalances.warehouseId, filters.warehouseId),
        ),
      )
      .leftJoin(
        warehouses,
        eq(warehouses.id, inventoryBalances.warehouseId),
      )
      .where(
        and(
          eq(products.businessId, filters.businessId),
          eq(products.active, true),
          eq(products.trackInventory, true),
          sql`coalesce(${products.reorderLevel}, 0) > 0`,
        ),
      )
      .groupBy(
        products.id,
        products.name,
        products.sku,
        products.reorderLevel,
        products.minimumStock,
        warehouses.id,
        warehouses.name,
      )
      .having(
        sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0) <= coalesce(${products.reorderLevel}, 0)`,
      );

    return rows.map((r) => ({
      productId: r.productId,
      productName: r.productName,
      sku: r.sku,
      warehouseId: r.warehouseId ?? filters.warehouseId ?? null,
      warehouseName: r.warehouseName ?? null,
      currentQuantity: Number(r.currentQuantity ?? 0),
      reorderLevel: r.reorderLevel != null ? Number(r.reorderLevel) : null,
      minimumStock: r.minimumStock != null ? Number(r.minimumStock) : null,
    }));
  }

  // Business-wide: total stock across warehouses vs product reorder level
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      sku: products.sku,
      currentQuantity: sql<number>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
      reorderLevel: products.reorderLevel,
      minimumStock: products.minimumStock,
    })
    .from(products)
    .leftJoin(
      inventoryBalances,
      and(
        eq(inventoryBalances.productId, products.id),
        eq(inventoryBalances.businessId, filters.businessId),
      ),
    )
    .where(
      and(
        eq(products.businessId, filters.businessId),
        eq(products.active, true),
        eq(products.trackInventory, true),
        sql`coalesce(${products.reorderLevel}, 0) > 0`,
      ),
    )
    .groupBy(
      products.id,
      products.name,
      products.sku,
      products.reorderLevel,
      products.minimumStock,
    )
    .having(
      sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0) <= coalesce(${products.reorderLevel}, 0)`,
    );

  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    sku: r.sku,
    warehouseId: null,
    warehouseName: null,
    currentQuantity: Number(r.currentQuantity ?? 0),
    reorderLevel: r.reorderLevel != null ? Number(r.reorderLevel) : null,
    minimumStock: r.minimumStock != null ? Number(r.minimumStock) : null,
  }));
}

/** Unique product count — same rules as getLowStockProducts (all warehouses). */
export async function countLowStockProducts(
  businessId: string,
): Promise<number> {
  const rows = await getLowStockProducts({ businessId });
  return rows.length;
}
