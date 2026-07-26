import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { accountTypes } from "./account_types";
import { relations } from "drizzle-orm";

import { chartOfAccounts } from "./chart_of_accounts";

export const accountCategories = pgTable(
  "account_categories",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global category
    // UUID = Business-specific category
    businessId: uuid("business_id")
      .references(() => businesses.id),

    accountTypeId: uuid("account_type_id")
      .notNull()
      .references(() => accountTypes.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    description: text("description"),

    displayOrder: integer("display_order")
      .default(0)
      .notNull(),

    isSystem: boolean("is_system")
      .default(true)
      .notNull(),

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
    businessIdx: index("account_categories_business_idx")
      .on(table.businessId),

    accountTypeIdx: index("account_categories_type_idx")
      .on(table.accountTypeId),

    activeIdx: index("account_categories_active_idx")
      .on(table.active),

    displayOrderIdx: index("account_categories_display_order_idx")
      .on(table.displayOrder),

    uniqueCode: uniqueIndex(
      "account_categories_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),
  })
);
export const accountCategoriesRelations = relations(
  accountCategories,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [accountCategories.businessId],
      references: [businesses.id],
    }),

    accountType: one(accountTypes, {
      fields: [accountCategories.accountTypeId],
      references: [accountTypes.id],
    }),

    // Chart of accounts under this category
    accounts: many(chartOfAccounts),
  })
);