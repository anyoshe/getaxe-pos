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
import { normalBalanceEnum } from "../shared";

export const accountTypes = pgTable(
  "account_types",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global system account type
    // UUID = Business-specific account type
    businessId: uuid("business_id")
      .references(() => businesses.id),

    // AST, LIA, REV...
    code: text("code")
      .notNull(),

    // Assets, Liabilities...
    name: text("name")
      .notNull(),

    description: text("description"),

    // Debit or Credit
    normalBalance: normalBalanceEnum("normal_balance")
      .notNull(),

    // Controls ordering in reports
    displayOrder: integer("display_order")
      .default(0)
      .notNull(),

    // Prevent deleting default account types
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
    businessIdx: index("account_types_business_idx")
      .on(table.businessId),

    activeIdx: index("account_types_active_idx")
      .on(table.active),

    displayOrderIdx: index("account_types_display_order_idx")
      .on(table.displayOrder),

    uniqueCode: uniqueIndex(
      "account_types_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),
  })
);