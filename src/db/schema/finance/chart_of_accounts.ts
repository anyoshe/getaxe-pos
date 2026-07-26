import {
    pgTable,
    uuid,
    text,
    boolean,
    timestamp,
    integer,
    index,
    uniqueIndex,
    foreignKey,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { accountTypes } from "./account_types";
import { accountCategories } from "./account_categories";
import { relations } from "drizzle-orm";

import { cashAccounts } from "./cash_accounts";
import { journalEntryLines } from "./journal_entry_lines";

export const chartOfAccounts = pgTable(
    "chart_of_accounts",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        businessId: uuid("business_id")
            .notNull()
            .references(() => businesses.id),




        accountCategoryId: uuid("account_category_id")
            .notNull()
            .references(() => accountCategories.id),

        // Parent account (for account hierarchy)
        parentAccountId: uuid("parent_account_id"),

        // e.g. 1000, 1100, 1201
        accountCode: text("account_code")
            .notNull(),

        // e.g. Cash, Inventory, Sales Revenue
        accountName: text("account_name")
            .notNull(),

        description: text("description"),

        // Depth in the account tree
        level: integer("level")
            .default(1)
            .notNull(),

        // Controls report ordering
        displayOrder: integer("display_order")
            .default(0)
            .notNull(),

        // Prevent deletion/editing of system accounts
        isSystem: boolean("is_system")
            .default(false)
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
        parentAccountFk: foreignKey({
            columns: [table.parentAccountId],
            foreignColumns: [table.id],
            name: "coa_parent_account_fk",
        }),

        businessIdx: index("coa_business_idx")
            .on(table.businessId),

        accountCategoryIdx: index("coa_account_category_idx")
            .on(table.accountCategoryId),

        parentIdx: index("coa_parent_idx")
            .on(table.parentAccountId),

        activeIdx: index("coa_active_idx")
            .on(table.active),

        displayOrderIdx: index("coa_display_order_idx")
            .on(table.displayOrder),

        uniqueAccountCode: uniqueIndex(
            "coa_business_account_code_unique"
        ).on(
            table.businessId,
            table.accountCode
        ),
    })
);

export const chartOfAccountsRelations = relations(
  chartOfAccounts,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [chartOfAccounts.businessId],
      references: [businesses.id],
    }),

    accountCategory: one(accountCategories, {
      fields: [chartOfAccounts.accountCategoryId],
      references: [accountCategories.id],
    }),

    parentAccount: one(chartOfAccounts, {
      fields: [chartOfAccounts.parentAccountId],
      references: [chartOfAccounts.id],
      relationName: "accountHierarchy",
    }),

    childAccounts: many(chartOfAccounts, {
      relationName: "accountHierarchy",
    }),

    cashAccounts: many(cashAccounts),

    journalEntryLines: many(journalEntryLines),
  })
);