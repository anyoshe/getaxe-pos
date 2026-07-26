import {
  pgTable,
  uuid,
  integer,
  numeric,
  index,
  check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { sales } from "./sales";
import { products } from "../inventory/products";
import { productBatches } from "../inventory/product_batches";
import { saleReturnItems } from "./sale_return_items";

import { relations } from "drizzle-orm";
import { saleItemBatches } from "./sale_item_batches";


export const saleItems = pgTable(
  "sale_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
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

    discount: numeric("discount", {
      precision: 12,
      scale: 2,
    }).default("0"),

    tax: numeric("tax", {
      precision: 12,
      scale: 2,
    }).default("0"),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    businessIdx: index(
      "sale_items_business_idx"
    ).on(table.businessId),

    saleIdx: index(
      "sale_items_sale_idx"
    ).on(table.saleId),

    productIdx: index(
      "sale_items_product_idx"
    ).on(table.productId),

    productBatchIdx: index(
      "sale_items_product_batch_idx"
    ).on(table.productBatchId),

    quantityCheck: check(
      "sale_items_quantity_positive",
      sql`${table.quantity} > 0`
    ),
  })
);

export const saleItemsRelations = relations(
  saleItems,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [saleItems.businessId],
      references: [businesses.id],
    }),

    sale: one(sales, {
      fields: [saleItems.saleId],
      references: [sales.id],
    }),

    product: one(products, {
      fields: [saleItems.productId],
      references: [products.id],
    }),

    productBatch: one(productBatches, {
      fields: [saleItems.productBatchId],
      references: [productBatches.id],
    }),

    returnItems: many(saleReturnItems),
    batches: many(saleItemBatches),
  })
);