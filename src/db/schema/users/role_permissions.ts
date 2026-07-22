import {
  pgTable,
  uuid,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

import { roles } from "./roles";
import { permissions } from "./permissions";

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