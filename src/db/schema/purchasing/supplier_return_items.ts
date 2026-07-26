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
import { relations } from "drizzle-orm";

export const supplierReturnItems = pgTable(
  "supplier_return_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),


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

export const supplierReturnItemsRelations = relations(
  supplierReturnItems,
  ({ one }) => ({
    supplierReturn: one(supplierReturns, {
      fields: [supplierReturnItems.supplierReturnId],
      references: [supplierReturns.id],
    }),

    product: one(products, {
      fields: [supplierReturnItems.productId],
      references: [products.id],
    }),

    productBatch: one(productBatches, {
      fields: [supplierReturnItems.productBatchId],
      references: [productBatches.id],
    }),
  })
);