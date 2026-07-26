import {
  pgTable,
  uuid,
  integer,
  numeric,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { saleReturns } from "./sale_returns";
import { saleItems } from "./sale_items";
import { productBatches } from "../inventory/product_batches";
import { relations } from "drizzle-orm";

export const saleReturnItems = pgTable(
  "sale_return_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    saleReturnId: uuid("sale_return_id")
      .notNull()
      .references(() => saleReturns.id, {
        onDelete: "cascade",
      }),

    saleItemId: uuid("sale_item_id")
      .notNull()
      .references(() => saleItems.id, {
        onDelete: "restrict",
      }),

    productBatchId: uuid("product_batch_id")
      .references(() => productBatches.id, {
        onDelete: "restrict",
      }),

    quantity: integer("quantity")
      .notNull(),

    unitPrice: numeric("unit_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    returnIdx: index(
      "sale_return_items_return_idx"
    ).on(table.saleReturnId),

    saleItemIdx: index(
      "sale_return_items_sale_item_idx"
    ).on(table.saleItemId),

    batchIdx: index(
      "sale_return_items_batch_idx"
    ).on(table.productBatchId),

    uniqueBatchReturn: uniqueIndex(
      "sale_return_item_batch_unique"
    ).on(
      table.saleReturnId,
      table.saleItemId,
      table.productBatchId
    ),

    quantityCheck: check(
      "sale_return_items_quantity_positive",
      sql`${table.quantity} > 0`
    ),
  })
);

export const saleReturnItemsRelations = relations(
  saleReturnItems,
  ({ one }) => ({
    saleReturn: one(saleReturns, {
      fields: [saleReturnItems.saleReturnId],
      references: [saleReturns.id],
    }),

    saleItem: one(saleItems, {
      fields: [saleReturnItems.saleItemId],
      references: [saleItems.id],
    }),

    productBatch: one(productBatches, {
      fields: [saleReturnItems.productBatchId],
      references: [productBatches.id],
    }),
  })
);