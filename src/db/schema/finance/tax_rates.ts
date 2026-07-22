
import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";

export const taxRates = pgTable(
  "tax_rates",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    rate: numeric("rate", {
      precision: 5,
      scale: 2,
    })
      .notNull(),

    description: text("description"),

    isDefault: boolean("is_default")
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
    businessIdx: index("tax_rates_business_idx")
      .on(table.businessId),

    activeIdx: index("tax_rates_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "tax_rates_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),
  })
);

