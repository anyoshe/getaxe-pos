import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { products } from "./products";
import { units } from "../settings/units";

/**
 * Product-specific units of measure.
 * factorToStock = how many canonical stock units equal 1 of this unit.
 * Inventory balances always store stock units only.
 */
export const productUnits = pgTable(
  "product_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "restrict" }),

    factorToStock: numeric("factor_to_stock", {
      precision: 18,
      scale: 6,
    })
      .notNull()
      .default("1"),

    isStockUnit: boolean("is_stock_unit").default(false).notNull(),
    isPurchaseDefault: boolean("is_purchase_default").default(false).notNull(),
    isSalesDefault: boolean("is_sales_default").default(false).notNull(),
    allowPurchase: boolean("allow_purchase").default(true).notNull(),
    allowSale: boolean("allow_sale").default(true).notNull(),

    barcode: text("barcode"),

    active: boolean("active").default(true).notNull(),

    /** Historical integrity: close row instead of changing factor in place. */
    validFrom: timestamp("valid_from").defaultNow().notNull(),
    validTo: timestamp("valid_to"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessIdx: index("product_units_business_idx").on(table.businessId),
    productIdx: index("product_units_product_idx").on(table.productId),
  }),
);

export const productUnitsRelations = relations(productUnits, ({ one }) => ({
  business: one(businesses, {
    fields: [productUnits.businessId],
    references: [businesses.id],
  }),
  product: one(products, {
    fields: [productUnits.productId],
    references: [products.id],
  }),
  unit: one(units, {
    fields: [productUnits.unitId],
    references: [units.id],
  }),
}));
