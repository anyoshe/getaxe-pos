import {
  pgTable,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

import { roles } from "./roles";
import { permissions } from "./permissions";

import { relations } from "drizzle-orm";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
      }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
      }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.roleId, table.permissionId],
    }),

    permissionIdx: index(
      "role_permissions_permission_idx"
    ).on(table.permissionId),
  })
);


export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),

    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);