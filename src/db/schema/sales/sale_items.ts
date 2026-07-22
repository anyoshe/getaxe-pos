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

    quantityCheck: check(
      "sale_items_quantity_positive",
      sql`${table.quantity} > 0`
    ),
  })
);