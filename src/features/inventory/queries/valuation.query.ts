import {
  and,
  eq,
  sql,
} from "drizzle-orm";

import { db } from "@/db";

import {
  inventoryBalances,
  productBatches,
  products,
  warehouses,
} from "@/db/schema";


export interface ValuationFilters {

  businessId: string;

  warehouseId?: string;

}


export async function getStockValuation(
  filters: ValuationFilters
) {

  const conditions = [
    eq(
      inventoryBalances.businessId,
      filters.businessId
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


      costPrice:
        sql<number>`
          AVG(
            ${productBatches.costPrice}
          )
        `,


      stockValue:
        sql<number>`
          SUM(
            ${inventoryBalances.quantity}
            *
            ${productBatches.costPrice}
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

    .leftJoin(
      productBatches,
      eq(
        inventoryBalances.batchId,
        productBatches.id
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