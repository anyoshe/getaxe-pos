import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { expenseCategories } from "./expense_categories";
import { users } from "../users/users";

/**
 * Anticipated monthly fixed costs (rent, salaries, utilities…).
 * Not cash movements until the owner records a matching expense payment.
 * Used for dashboard "next 30 days" and break-even vs sales.
 */
export const recurringExpenses = pgTable(
  "recurring_expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id),

    name: text("name").notNull(),

    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

    /** Day of month the cost is typically due (1–28 recommended). */
    dayOfMonth: integer("day_of_month").notNull().default(1),

    notes: text("notes"),

    active: boolean("active").notNull().default(true),

    createdBy: uuid("created_by").references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessIdx: index("recurring_expenses_business_idx").on(table.businessId),
    activeIdx: index("recurring_expenses_active_idx").on(
      table.businessId,
      table.active,
    ),
  }),
);

export const recurringExpensesRelations = relations(
  recurringExpenses,
  ({ one }) => ({
    business: one(businesses, {
      fields: [recurringExpenses.businessId],
      references: [businesses.id],
    }),
    category: one(expenseCategories, {
      fields: [recurringExpenses.categoryId],
      references: [expenseCategories.id],
    }),
    createdByUser: one(users, {
      fields: [recurringExpenses.createdBy],
      references: [users.id],
    }),
  }),
);
