import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { products } from "./products";

export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    discountType: text("discount_type").notNull().default("PERCENT_OFF"),
    discountValue: numeric("discount_value", { precision: 12, scale: 4 })
      .notNull()
      .default("0"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    scope: text("scope").notNull().default("ALL"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    businessIdx: index("promotions_business_idx").on(t.businessId),
    activeIdx: index("promotions_active_idx").on(t.active),
    uniqueCode: uniqueIndex("promotions_business_code_unique").on(
      t.businessId,
      t.code,
    ),
  }),
);

export const promotionProducts = pgTable(
  "promotion_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    uniquePair: uniqueIndex("promotion_products_unique").on(
      t.promotionId,
      t.productId,
    ),
    productIdx: index("promotion_products_product_idx").on(t.productId),
  }),
);

export const promotionsRelations = relations(promotions, ({ many }) => ({
  products: many(promotionProducts),
}));

export const promotionProductsRelations = relations(
  promotionProducts,
  ({ one }) => ({
    promotion: one(promotions, {
      fields: [promotionProducts.promotionId],
      references: [promotions.id],
    }),
    product: one(products, {
      fields: [promotionProducts.productId],
      references: [products.id],
    }),
  }),
);
