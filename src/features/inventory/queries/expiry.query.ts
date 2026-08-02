import {
  and,
  asc,
  eq,
  lte,
  gt,
} from "drizzle-orm";

import { db } from "@/db";

import {
  productBatches,
  products,
  suppliers,
} from "@/db/schema";


export interface ExpiryFilters {
  businessId: string;

  beforeDate?: string;

  expired?: boolean;
}


export async function getExpiryStock(
  filters: ExpiryFilters
) {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const expiryDate =
    filters.beforeDate ?? today;


  const conditions = [
    eq(
      productBatches.businessId,
      filters.businessId
    ),

    eq(
      products.trackExpiry,
      true
    ),

  ];


  if (filters.expired) {

    conditions.push(
      lte(
        productBatches.expiryDate,
        expiryDate
      )
    );

  } else {

    conditions.push(
      gt(
        productBatches.expiryDate,
        expiryDate
      )
    );

    conditions.push(
      lte(
        productBatches.expiryDate,
        expiryDate
      )
    );

  }


  return db
    .select({

      productId:
        products.id,

      productName:
        products.name,


      batchNumber:
        productBatches.batchNumber,


      expiryDate:
        productBatches.expiryDate,


      quantityRemaining:
        productBatches.quantityRemaining,


      supplierName:
        suppliers.name,

    })

    .from(productBatches)

    .innerJoin(
      products,
      eq(
        productBatches.productId,
        products.id
      )
    )

    .leftJoin(
      suppliers,
      eq(
        productBatches.supplierId,
        suppliers.id
      )
    )

    .where(
      and(...conditions)
    )

    .orderBy(
      asc(
        productBatches.expiryDate
      )
    );
}