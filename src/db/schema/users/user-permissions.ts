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
    permissions,
} from "./permissions";

export const userPermissions = pgTable(
    "user_permissions",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        permissionId: uuid("permission_id")
            .notNull()
            .references(() => permissions.id, {
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
                table.permissionId,
            ],
        }),

        userIdx: index(
            "user_permissions_user_idx",
        ).on(
            table.userId,
        ),

        permissionIdx: index(
            "user_permissions_permission_idx",
        ).on(
            table.permissionId,
        ),
    }),
);

export const userPermissionsRelations =
    relations(
        userPermissions,
        ({ one }) => ({
            user: one(users, {
                fields: [
                    userPermissions.userId,
                ],
                references: [
                    users.id,
                ],
            }),

            permission: one(permissions, {
                fields: [
                    userPermissions.permissionId,
                ],
                references: [
                    permissions.id,
                ],
            }),
        }),
    );