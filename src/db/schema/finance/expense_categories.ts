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

export const expenseCategories = pgTable(
  "expense_categories",
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
    businessIdx: index("expense_categories_business_idx")
      .on(table.businessId),

    activeIdx: index("expense_categories_active_idx")
      .on(table.active),

    businessNameUnique: uniqueIndex(
      "expense_categories_business_name_unique"
    ).on(table.businessId, table.name),
  })
);