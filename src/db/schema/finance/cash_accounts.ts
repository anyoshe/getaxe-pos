
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { chartOfAccounts } from "./chart_of_accounts";
import { cashAccountTypeEnum } from "../shared";
import { relations } from "drizzle-orm";

import { payments } from "../sales/payments";

export const cashAccounts = pgTable(
  "cash_accounts",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    // Ledger account backing this cash/bank account
    accountId: uuid("account_id")
      .notNull()
      .references(() => chartOfAccounts.id),

    // e.g. Main Cash Drawer, KCB Current, M-Pesa Till
    name: text("name")
      .notNull(),

    // CASH | BANK | MPESA | AIRTEL | PETTY_CASH ...
    type: cashAccountTypeEnum("type")
      .notNull(),

    accountNumber: text("account_number"),

    bankName: text("bank_name"),

    branchName: text("branch_name"),

    currency: text("currency")
      .default("KES")
      .notNull(),

    openingBalance: numeric("opening_balance", {
      precision: 18,
      scale: 2,
    })
      .default("0")
      .notNull(),

    /**
     * Flexible provider-specific information.
     *
     * Bank example:
     * {
     *   "swift": "KCBLKENX",
     *   "branchCode": "011"
     * }
     *
     * M-Pesa example:
     * {
     *   "paybill": "123456",
     *   "account": "Main"
     * }
     *
     * Airtel example:
     * {
     *   "merchantCode": "98765"
     * }
     */
    details: jsonb("details"),

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
    businessIdx: index("cash_accounts_business_idx")
      .on(table.businessId),

    accountIdx: index("cash_accounts_account_idx")
      .on(table.accountId),

    typeIdx: index("cash_accounts_type_idx")
      .on(table.type),

    activeIdx: index("cash_accounts_active_idx")
      .on(table.active),

    uniqueName: uniqueIndex(
      "cash_accounts_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

export const cashAccountsRelations = relations(
  cashAccounts,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [cashAccounts.businessId],
      references: [businesses.id],
    }),

    account: one(chartOfAccounts, {
      fields: [cashAccounts.accountId],
      references: [chartOfAccounts.id],
    }),

    payments: many(payments),
  })
);