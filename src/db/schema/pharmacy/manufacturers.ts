
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

export const manufacturers = pgTable(
  "manufacturers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global manufacturer
    // UUID = Business-specific manufacturer
    businessId: uuid("business_id")
      .references(() => businesses.id),

    name: text("name")
      .notNull(),

    country: text("country"),

    email: text("email"),

    phone: text("phone"),

    website: text("website"),

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
    businessIdx: index("manufacturers_business_idx")
      .on(table.businessId),

    activeIdx: index("manufacturers_active_idx")
      .on(table.active),

    uniqueName: uniqueIndex(
      "manufacturers_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

