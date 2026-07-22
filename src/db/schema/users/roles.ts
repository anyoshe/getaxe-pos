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

export const roles = pgTable(
  "roles",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = System Role
    // UUID = Business-specific Role
    businessId: uuid("business_id")
      .references(() => businesses.id),

    name: text("name")
      .notNull(),

    description: text("description"),

    isSystem: boolean("is_system")
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
    businessIdx: index("roles_business_idx")
      .on(table.businessId),

    activeIdx: index("roles_active_idx")
      .on(table.active),

    systemIdx: index("roles_system_idx")
      .on(table.isSystem),

    businessNameUnique: uniqueIndex(
      "roles_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);