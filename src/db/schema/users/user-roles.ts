import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

import {
  relations,
} from "drizzle-orm";

import {
  users,
} from "./users";

import {
  roles,
} from "./roles";


export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    pk: primaryKey({
      columns: [
        table.userId,
        table.roleId,
      ],
    }),

    userIdx: index(
      "user_roles_user_idx"
    ).on(
      table.userId
    ),

    roleIdx: index(
      "user_roles_role_idx"
    ).on(
      table.roleId
    ),
  })
);


export const userRolesRelations =
relations(
  userRoles,
  ({ one }) => ({

    user: one(users, {
      fields: [
        userRoles.userId,
      ],
      references: [
        users.id,
      ],
    }),

    role: one(roles, {
      fields: [
        userRoles.roleId,
      ],
      references: [
        roles.id,
      ],
    }),

  })
);