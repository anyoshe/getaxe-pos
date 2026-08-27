import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { cashAccounts } from "./cash_accounts";
import { users } from "../users/users";

/**
 * End-of-day (or shift) count for a cash/bank/M-Pesa account.
 * expected = opening + inflows − outflows for the period;
 * counted = what the cashier physically counted / statement balance.
 */
export const cashReconciliations = pgTable(
  "cash_reconciliations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    cashAccountId: uuid("cash_account_id")
      .notNull()
      .references(() => cashAccounts.id),

    /** Business date being closed (Nairobi calendar day). */
    reconciliationDate: date("reconciliation_date").notNull(),

    openingBalance: numeric("opening_balance", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),

    systemInflows: numeric("system_inflows", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),

    systemOutflows: numeric("system_outflows", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),

    expectedBalance: numeric("expected_balance", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),

    countedBalance: numeric("counted_balance", { precision: 18, scale: 2 })
      .notNull(),

    difference: numeric("difference", { precision: 18, scale: 2 })
      .notNull()
      .default("0"),

    notes: text("notes"),

    status: text("status").notNull().default("COMPLETED"),

    reconciledBy: uuid("reconciled_by").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessIdx: index("cash_recon_business_idx").on(table.businessId),
    accountIdx: index("cash_recon_account_idx").on(table.cashAccountId),
    dateIdx: index("cash_recon_date_idx").on(table.reconciliationDate),
    uniqueDay: uniqueIndex("cash_recon_account_date_unique").on(
      table.businessId,
      table.cashAccountId,
      table.reconciliationDate,
    ),
  }),
);

export const cashReconciliationsRelations = relations(
  cashReconciliations,
  ({ one }) => ({
    business: one(businesses, {
      fields: [cashReconciliations.businessId],
      references: [businesses.id],
    }),
    cashAccount: one(cashAccounts, {
      fields: [cashReconciliations.cashAccountId],
      references: [cashAccounts.id],
    }),
    reconciledByUser: one(users, {
      fields: [cashReconciliations.reconciledBy],
      references: [users.id],
    }),
  }),
);
