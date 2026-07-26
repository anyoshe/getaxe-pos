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
import { roles } from "./roles";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),

    name: text("name")
      .notNull(),

    email: text("email")
      .notNull(),

    phone: text("phone"),

    passwordHash: text("password_hash")
      .notNull(),

    lastLoginAt: timestamp("last_login_at"),

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
    businessIdx: index("users_business_idx")
      .on(table.businessId),

    roleIdx: index("users_role_idx")
      .on(table.roleId),

    activeIdx: index("users_active_idx")
      .on(table.active),

    businessEmailUnique: uniqueIndex(
      "users_business_email_unique"
    ).on(
      table.businessId,
      table.email
    ),
  })
);
export const usersRelations = relations(users, ({ one }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),

  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
}));