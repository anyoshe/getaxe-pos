import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { relations } from "drizzle-orm";
import { products } from "./products";

export const categories = pgTable(
  "categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    name: text("name")
      .notNull(),

    description: text("description"),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("categories_business_idx").on(table.businessId),

    nameIdx: index("categories_name_idx").on(table.name),

    businessNameUnique: uniqueIndex("categories_business_name_unique").on(
      table.businessId,
      table.name
    ),
  })
);
export const categoriesRelations = relations(
  categories,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [categories.businessId],
      references: [businesses.id],
    }),

    products: many(products),
  })
);