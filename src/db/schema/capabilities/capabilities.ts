import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  businesses,
} from "../core/businesses";


export const capabilities = pgTable(
  "capabilities",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    code: text("code")
      .notNull()
      .unique(),

    capabilityId: text("capability_id")
      .notNull()
      .unique(),

    name: text("name")
      .notNull(),

    description: text("description"),

    module: text("module")
      .notNull(),

    group: text("group")
      .notNull(),

    category: text("category")
      .notNull(),

    status: text("status")
      .notNull(),

    defaultEnabled: boolean("default_enabled")
      .default(false)
      .notNull(),

    industries: jsonb("industries")
      .$type<string[]>()
      .default([]),

    dependencies: jsonb("dependencies")
      .$type<string[]>()
      .default([]),

    conflicts: jsonb("conflicts")
      .$type<string[]>()
      .default([]),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone: true,
      },
    ).defaultNow(),

    updatedAt: timestamp(
      "updated_at",
      {
        withTimezone: true,
      },
    ).defaultNow(),

  },
  table => ({
    codeIdx: index(
      "capabilities_code_idx",
    ).on(table.code),

    capabilityIdx: index(
      "capabilities_capability_id_idx",
    ).on(table.capabilityId),

  }),
);