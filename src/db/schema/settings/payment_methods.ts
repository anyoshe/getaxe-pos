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
import { cashAccounts } from "../finance/cash_accounts";

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global payment method
    // UUID = Business-specific payment method
    businessId: uuid("business_id")
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    description: text("description"),

    defaultCashAccountId: uuid("default_cash_account_id")
      .references(() => cashAccounts.id),

    requiresReference: boolean("requires_reference")
      .default(false)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    isDefault: boolean("is_default")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("payment_methods_business_idx")
      .on(table.businessId),

    activeIdx: index("payment_methods_active_idx")
      .on(table.active),

    defaultIdx: index("payment_methods_default_idx")
      .on(table.isDefault),

    requiresReferenceIdx: index(
      "payment_methods_requires_reference_idx"
    ).on(table.requiresReference),

    uniqueCode: uniqueIndex(
      "payment_methods_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "payment_methods_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);