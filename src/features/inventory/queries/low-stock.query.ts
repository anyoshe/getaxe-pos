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

/**
 * Products (optionally per warehouse) at or below reorder level.
 * Only products with reorderLevel > 0 and trackInventory.
 * Qty is summed from inventory_balances; missing balances = 0 via left join path
 * handled by including products with zero stock through a union approach:
 * we select from products and left join balances so never-received items still appear.
 */
export async function getLowStockProducts(filters: LowStockFilters) {
  const warehouseCond = filters.warehouseId
    ? sql`and ${inventoryBalances.warehouseId} = ${filters.warehouseId}`
    : sql``;

  // Product-level rows (canonical count for dashboard)
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      sku: products.sku,
      warehouseId: warehouses.id,
      warehouseName: warehouses.name,
      currentQuantity: sql<number>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
      reorderLevel: products.reorderLevel,
      minimumStock: products.minimumStock,
    })
    .from(products)
    .leftJoin(
      inventoryBalances,
      and(
        eq(inventoryBalances.productId, products.id),
        eq(inventoryBalances.businessId, filters.businessId),
        filters.warehouseId
          ? eq(inventoryBalances.warehouseId, filters.warehouseId)
          : sql`true`,
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
      sql`coalesce(sum(${inventoryBalances.quantity}), 0) <= ${products.reorderLevel}`,
    );

  return rows;
}

/** Unique product count — same rules as getLowStockProducts (all warehouses). */
export async function countLowStockProducts(businessId: string): Promise<number> {
  const rows = await getLowStockProducts({ businessId });
  const ids = new Set(rows.map((r) => r.productId));
  return ids.size;
}
