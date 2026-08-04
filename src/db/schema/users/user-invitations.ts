import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { roles } from "./roles";


export const userInvitations = pgTable(
  "user_invitations",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: text("name")
      .notNull(),

    email: text("email")
      .notNull(),

    phone: text("phone"),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),

    createdBy: uuid("created_by")
      .notNull(),


    passwordHash: text("password_hash"),


    status: text("status")
      .default("INVITED")
      .notNull(),


    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    emailUnique:
      uniqueIndex(
        "user_invitations_email_unique",
      )
      .on(table.email),
  }),
);