import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { expenseCategories } from "./expense_categories";
import { cashAccounts } from "./cash_accounts";
import { users } from "../users/users";
import { expenseStatusEnum } from "../shared"

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id),

    cashAccountId: uuid("cash_account_id")
      .references(() => cashAccounts.id),

    description: text("description")
      .notNull(),

    amount: numeric("amount", {
      precision: 12,
      scale: 2,
    }).notNull(),

    reference: text("reference"),

    status: expenseStatusEnum("status")
      .default("PAID")
      .notNull(),

    paidTo: text("paid_to"),

    createdBy: uuid("created_by")
      .references(() => users.id),

    expenseDate: timestamp("expense_date")
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("expenses_business_idx")
      .on(table.businessId),

    categoryIdx: index("expenses_category_idx")
      .on(table.categoryId),

    cashAccountIdx: index("expenses_cash_account_idx")
      .on(table.cashAccountId),

    expenseDateIdx: index("expenses_date_idx")
      .on(table.expenseDate),
  })
);