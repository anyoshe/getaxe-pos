import {
  and,
  desc,
  eq,
  gte,
  lte,
} from "drizzle-orm";

import { db } from "@/db";

import {
  stockMovements,
  products,
  warehouses,
  productBatches,
  users,
} from "@/db/schema";


export interface StockMovementFilters {

  businessId: string;

  productId?: string;

  warehouseId?: string;

  batchId?: string;

  from?: Date;

  to?: Date;

}


export async function getStockMovements(
  filters: StockMovementFilters
) {

  const conditions = [
    eq(
      stockMovements.businessId,
      filters.businessId
    ),
  ];


  if (filters.productId) {
    conditions.push(
      eq(
        stockMovements.productId,
        filters.productId
      )
    );
  }


  if (filters.warehouseId) {
    conditions.push(
      eq(
        stockMovements.warehouseId,
        filters.warehouseId
      )
    );
  }


  if (filters.batchId) {
    conditions.push(
      eq(
        stockMovements.batchId,
        filters.batchId
      )
    );
  }


  if (filters.from) {
    conditions.push(
      gte(
        stockMovements.createdAt,
        filters.from
      )
    );
  }


  if (filters.to) {
    conditions.push(
      lte(
        stockMovements.createdAt,
        filters.to
      )
    );
  }


  return db
    .select({

      id:
        stockMovements.id,

      movementType:
        stockMovements.movementType,

      quantity:
        stockMovements.quantity,

      reference:
        stockMovements.reference,

      notes:
        stockMovements.notes,

      createdAt:
        stockMovements.createdAt,


      productId:
        products.id,

      productName:
        products.name,


      warehouseId:
        warehouses.id,

      warehouseName:
        warehouses.name,


      batchNumber:
        productBatches.batchNumber,


      userId:
        users.id,

      userName:
        users.name,

    })

    .from(stockMovements)

    .innerJoin(
      products,
      eq(
        stockMovements.productId,
        products.id
      )
    )

    .innerJoin(
      warehouses,
      eq(
        stockMovements.warehouseId,
        warehouses.id
      )
    )

    .leftJoin(
      productBatches,
      eq(
        stockMovements.batchId,
        productBatches.id
      )
    )

    .leftJoin(
      users,
      eq(
        stockMovements.userId,
        users.id
      )
    )

    .where(
      and(...conditions)
    )

    .orderBy(
      desc(
        stockMovements.createdAt
      )
    );
}