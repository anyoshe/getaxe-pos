
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

export const priceLists = pgTable(
  "price_lists",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
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
    businessIdx: index("price_lists_business_idx")
      .on(table.businessId),

    activeIdx: index("price_lists_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "price_lists_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "price_lists_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

