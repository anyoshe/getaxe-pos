import {
  pgTable,
  uuid,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";

import { supplierReturns } from "./supplier_returns";
import { products } from "../inventory/products";
import { productBatches } from "../inventory/product_batches";


export const supplierReturnItems = pgTable(
  "supplier_return_items",
  {
    supplierReturnId: uuid("supplier_return_id")
      .notNull()
      .references(() => supplierReturns.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    productBatchId: uuid("product_batch_id")
      .references(() => productBatches.id),

    quantity: integer("quantity")
      .notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    supplierReturnIdx: index("supplier_return_item_return_idx").on(
      table.supplierReturnId
    ),

    productIdx: index("supplier_return_item_product_idx").on(
      table.productId
    ),
  })
);