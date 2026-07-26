import {
  pgTable,
  uuid,
  integer,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { saleItems } from "./sale_items";
import { productBatches } from "../inventory/product_batches";
import { relations } from "drizzle-orm";

export const saleItemBatches = pgTable(
  "sale_item_batches",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    saleItemId: uuid("sale_item_id")
      .notNull()
      .references(() => saleItems.id, {
        onDelete: "cascade",
      }),

    productBatchId: uuid("product_batch_id")
      .notNull()
      .references(() => productBatches.id, {
        onDelete: "restrict",
      }),

    quantity: integer("quantity")
      .notNull(),
  },
  (table) => ({
    saleItemIdx: index(
      "sale_item_batches_sale_item_idx"
    ).on(table.saleItemId),

    batchIdx: index(
      "sale_item_batches_batch_idx"
    ).on(table.productBatchId),

    uniqueAllocation: uniqueIndex(
      "sale_item_batch_unique"
    ).on(
      table.saleItemId,
      table.productBatchId
    ),

    quantityCheck: check(
      "sale_item_batch_quantity_positive",
      sql`${table.quantity} > 0`
    ),
  })
);

export const saleItemBatchesRelations = relations(
  saleItemBatches,
  ({ one }) => ({
    saleItem: one(saleItems, {
      fields: [saleItemBatches.saleItemId],
      references: [saleItems.id],
    }),

    productBatch: one(productBatches, {
      fields: [saleItemBatches.productBatchId],
      references: [productBatches.id],
    }),
  })
);