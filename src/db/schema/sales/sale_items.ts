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
import { units } from "../settings/units";
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

    /** Legacy: treated as stock qty when quantity_stock is null. */
    quantity: integer("quantity")
      .notNull(),

    unitId: uuid("unit_id").references(() => units.id),

    quantityEntered: numeric("quantity_entered", {
      precision: 18,
      scale: 6,
    }),

    quantityStock: integer("quantity_stock"),

    conversionFactor: numeric("conversion_factor", {
      precision: 18,
      scale: 6,
    }),

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


    returnItems: many(saleReturnItems),
    batches: many(saleItemBatches),
  })
);