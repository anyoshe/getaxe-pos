import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

import { rolePermissions } from "./role_permissions";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    module: text("module")
      .notNull(),

    description: text("description"),

    active: boolean("active")
      .default(true)
      .notNull(),

    isSystem: boolean("is_system")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    codeUnique: uniqueIndex(
      "permissions_code_unique"
    ).on(table.code),

    nameUnique: uniqueIndex(
      "permissions_name_unique"
    ).on(table.name),

    moduleIdx: index(
      "permissions_module_idx"
    ).on(table.module),

    activeIdx: index(
      "permissions_active_idx"
    ).on(table.active),
  })
);

export const permissionsRelations = relations(
  permissions,
  ({ many }) => ({
    rolePermissions: many(rolePermissions),
  })
);