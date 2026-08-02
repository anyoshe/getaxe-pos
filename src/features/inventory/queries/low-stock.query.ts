import {
  and,
  eq,
  sql,
} from "drizzle-orm";

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


export async function getLowStockProducts(
  filters: LowStockFilters
) {

  const conditions = [
    eq(
      inventoryBalances.businessId,
      filters.businessId
    ),

    eq(
      products.trackInventory,
      true
    ),
  ];


  if (filters.warehouseId) {
    conditions.push(
      eq(
        inventoryBalances.warehouseId,
        filters.warehouseId
      )
    );
  }


  return db
    .select({

      productId:
        products.id,

      productName:
        products.name,

      sku:
        products.sku,


      warehouseId:
        warehouses.id,

      warehouseName:
        warehouses.name,


      currentQuantity:
        sql<number>`
          SUM(
            ${inventoryBalances.quantity}
          )
        `,


      reorderLevel:
        products.reorderLevel,


      minimumStock:
        products.minimumStock,

    })

    .from(inventoryBalances)

    .innerJoin(
      products,
      eq(
        inventoryBalances.productId,
        products.id
      )
    )

    .innerJoin(
      warehouses,
      eq(
        inventoryBalances.warehouseId,
        warehouses.id
      )
    )

    .where(
      and(...conditions)
    )

    .groupBy(
      products.id,
      products.name,
      products.sku,
      products.reorderLevel,
      products.minimumStock,
      warehouses.id,
      warehouses.name
    )

    .having(
      sql`
        SUM(
          ${inventoryBalances.quantity}
        )
        <=
        ${products.reorderLevel}
      `
    );
}