import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { incomeCategories } from "./income_categories";
import { cashAccounts } from "./cash_accounts";
import { users } from "../users/users";
import { transactionStatusEnum } from "../shared";

export const incomes = pgTable(
  "incomes",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => incomeCategories.id),

    cashAccountId: uuid("cash_account_id")
      .references(() => cashAccounts.id),

    description: text("description")
      .notNull(),

    amount: numeric("amount", {
      precision: 18,
      scale: 2,
    }).notNull(),

    reference: text("reference"),

    receivedFrom: text("received_from"),

    receivedBy: uuid("received_by")
      .references(() => users.id),

    status: transactionStatusEnum("status")
      .default("COMPLETED")
      .notNull(),

    incomeDate: timestamp("income_date")
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
    businessIdx: index("incomes_business_idx")
      .on(table.businessId),

    categoryIdx: index("incomes_category_idx")
      .on(table.categoryId),

    cashAccountIdx: index("incomes_cash_account_idx")
      .on(table.cashAccountId),

    incomeDateIdx: index("incomes_date_idx")
      .on(table.incomeDate),

    statusIdx: index("incomes_status_idx")
      .on(table.status),
  })
);
