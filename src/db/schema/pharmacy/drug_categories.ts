
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
import { products } from "../inventory/products";

export const drugCategories = pgTable(
  "drug_categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global category
    // UUID = Business-specific category
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

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
    businessIdx: index("drug_categories_business_idx")
      .on(table.businessId),

    activeIdx: index("drug_categories_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "drug_categories_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "drug_categories_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

export const drugCategoriesRelations = relations(
  drugCategories,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [drugCategories.businessId],
      references: [businesses.id],
    }),

    products: many(products),
  })
);