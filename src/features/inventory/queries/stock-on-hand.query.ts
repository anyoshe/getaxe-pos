import {
  and,
  eq,
  gt,
  sql,
} from "drizzle-orm";

import { db } from "@/db";

import {
  inventoryBalances,
  products,
  warehouses,
} from "@/db/schema";


export interface StockOnHandFilters {
  businessId: string;

  warehouseId?: string;

  productId?: string;
}


export async function getStockOnHand(
  filters: StockOnHandFilters
) {

  const conditions = [
    eq(
      inventoryBalances.businessId,
      filters.businessId
    ),

    gt(
      inventoryBalances.quantity,
      "0"
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


  if (filters.productId) {
    conditions.push(
      eq(
        inventoryBalances.productId,
        filters.productId
      )
    );
  }


  return db
    .select({
      productId:
        products.id,

      productName:
        products.name,

      warehouseId:
        warehouses.id,

      warehouseName:
        warehouses.name,

      quantity:
        sql<number>`
          SUM(
            ${inventoryBalances.quantity}
          )
        `,
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
      warehouses.id,
      warehouses.name
    );
}