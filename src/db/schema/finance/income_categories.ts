
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

import { incomes } from "./incomes";

export const incomeCategories = pgTable(
  "income_categories",
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
    businessIdx: index("income_categories_business_idx")
      .on(table.businessId),

    activeIdx: index("income_categories_active_idx")
      .on(table.active),

    businessNameUnique: uniqueIndex(
      "income_categories_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

export const incomeCategoriesRelations = relations(
  incomeCategories,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [incomeCategories.businessId],
      references: [businesses.id],
    }),

    incomes: many(incomes),
  })
);