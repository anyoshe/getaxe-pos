import {
    and,
    eq,
} from "drizzle-orm";

import {
    Repository,
} from "../base/repository";

import {
    users,
} from "@/db/schema/users/users";

import {
    roles,
} from "@/db/schema/users/roles";

import {
    rolePermissions,
} from "@/db/schema/users/role_permissions";

import {
    userPermissions,
} from "@/db/schema/users/user-permissions";

import {
    permissions,
} from "@/db/schema/users/permissions";

export class UserPermissionRepository {

    /**
     * Check whether a user has a permission.
     *
     * A permission can come from:
     *
     * 1. The user's base role
     * 2. A permission explicitly assigned to the user
     *
     * The user, role, and permission must all be active.
     */
    async hasPermission(
        userId: string,
        permissionCode: string,
    ) {
        // Explicit deny always wins
        const denied = await Repository.db
            .select({ permissionId: permissions.id })
            .from(userPermissions)
            .innerJoin(
                permissions,
                eq(userPermissions.permissionId, permissions.id),
            )
            .where(
                and(
                    eq(userPermissions.userId, userId),
                    eq(userPermissions.effect, "deny"),
                    eq(permissions.code, permissionCode),
                    eq(permissions.active, true),
                ),
            )
            .limit(1);
        if (denied.length > 0) return false;

        const rolePermission =
            await Repository.db
                .select({
                    permissionId: permissions.id,
                })
                .from(users)
                .innerJoin(
                    roles,
                    eq(
                        users.roleId,
                        roles.id,
                    ),
                )
                .innerJoin(
                    rolePermissions,
                    eq(
                        roles.id,
                        rolePermissions.roleId,
                    ),
                )
                .innerJoin(
                    permissions,
                    eq(
                        rolePermissions.permissionId,
                        permissions.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            users.id,
                            userId,
                        ),
                        eq(
                            users.active,
                            true,
                        ),
                        eq(
                            roles.active,
                            true,
                        ),
                        eq(
                            permissions.active,
                            true,
                        ),
                        eq(
                            permissions.code,
                            permissionCode,
                        ),
                    ),
                )
                .limit(1);

        if (rolePermission.length > 0) {
            return true;
        }

        const directPermission =
            await Repository.db
                .select({
                    permissionId: permissions.id,
                })
                .from(users)
                .innerJoin(
                    userPermissions,
                    eq(
                        users.id,
                        userPermissions.userId,
                    ),
                )
                .innerJoin(
                    permissions,
                    eq(
                        userPermissions.permissionId,
                        permissions.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            users.id,
                            userId,
                        ),
                        eq(
                            users.active,
                            true,
                        ),
                        eq(
                            permissions.active,
                            true,
                        ),
                        eq(
                            permissions.code,
                            permissionCode,
                        ),
                    ),
                )
                .limit(1);

        return directPermission.length > 0;
    }


    /**
     * Return the effective permissions for a user.
     *
     * Effective permissions are the union of:
     *
     * - permissions inherited from the user's base role
     * - permissions directly assigned to the user
     */
    async getUserPermissions(
        userId: string,
    ) {

        const rolePermissionsResult =
            await Repository.db
                .select({
                    id: permissions.id,
                    code: permissions.code,
                    module: permissions.module,
                    name: permissions.name,
                    description: permissions.description,
                })
                .from(users)
                .innerJoin(
                    roles,
                    eq(
                        users.roleId,
                        roles.id,
                    ),
                )
                .innerJoin(
                    rolePermissions,
                    eq(
                        roles.id,
                        rolePermissions.roleId,
                    ),
                )
                .innerJoin(
                    permissions,
                    eq(
                        rolePermissions.permissionId,
                        permissions.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            users.id,
                            userId,
                        ),
                        eq(
                            users.active,
                            true,
                        ),
                        eq(
                            roles.active,
                            true,
                        ),
                        eq(
                            permissions.active,
                            true,
                        ),
                    ),
                );

        const directPermissionsResult =
            await Repository.db
                .select({
                    id: permissions.id,
                    code: permissions.code,
                    module: permissions.module,
                    name: permissions.name,
                    description: permissions.description,
                })
                .from(users)
                .innerJoin(
                    userPermissions,
                    eq(
                        users.id,
                        userPermissions.userId,
                    ),
                )
                .innerJoin(
                    permissions,
                    eq(
                        userPermissions.permissionId,
                        permissions.id,
                    ),
                )
                .where(
                    and(
                        eq(
                            users.id,
                            userId,
                        ),
                        eq(
                            users.active,
                            true,
                        ),
                        eq(
                            permissions.active,
                            true,
                        ),
                    ),
                );

        
        const overrides = await this.listOverrides(userId);
        const denyIds = new Set(
            overrides.filter((o) => o.effect === "deny").map((o) => o.id),
        );
        const grantPerms = overrides
            .filter((o) => o.effect === "grant")
            .map((o) => ({
                id: o.id,
                code: o.code,
                module: o.module,
                name: o.name,
                description: o.description ?? null,
            }));

        const uniquePermissions = new Map(
            [
                ...rolePermissionsResult.filter((p) => !denyIds.has(p.id)),
                ...grantPerms,
            ].map((permission) => [permission.id, permission]),
        );

        return Array.from(uniquePermissions.values());

    }


    /**
     * Return only the effective permission codes
     * for a user.
     */
    async getUserPermissionCodes(
        userId: string,
    ) {

        const result =
            await this.getUserPermissions(
                userId,
            );

        return result.map(
            (permission) =>
                permission.code,
        );
    }


    /**
     * Check whether a permission is directly
     * assigned to the user.
     *
     * This does NOT check role permissions.
     */
    async hasDirectPermission(
        userId: string,
        permissionId: string,
    ) {

        const result =
            await Repository.db
                .query.userPermissions.findFirst({
                    where: and(
                        eq(
                            userPermissions.userId,
                            userId,
                        ),
                        eq(
                            userPermissions.permissionId,
                            permissionId,
                        ),
                    ),
                });

        return !!result;
    }



    /**
     * Assign a permission directly to a user (grant or deny).
     */
    async assignDirectPermission(
        userId: string,
        permissionId: string,
        effect: "grant" | "deny" = "grant",
    ) {
        return Repository.db
            .insert(userPermissions)
            .values({
                userId,
                permissionId,
                effect,
            })
            .onConflictDoNothing();
    }

    /**
     * Remove a direct permission override from a user.
     */
    async removeDirectPermission(
        userId: string,
        permissionId: string,
    ) {
        return Repository.db
            .delete(userPermissions)
            .where(
                and(
                    eq(userPermissions.userId, userId),
                    eq(userPermissions.permissionId, permissionId),
                ),
            );
    }

    /**
     * Direct overrides only (grants and denies).
     */
    async getDirectPermissions(userId: string) {
        return Repository.db
            .select({
                id: permissions.id,
                code: permissions.code,
                module: permissions.module,
                name: permissions.name,
                description: permissions.description,
                effect: userPermissions.effect,
            })
            .from(userPermissions)
            .innerJoin(
                permissions,
                eq(userPermissions.permissionId, permissions.id),
            )
            .where(eq(userPermissions.userId, userId))
            .orderBy(permissions.module, permissions.code);
    }

    async listOverrides(userId: string) {
        return this.getDirectPermissions(userId);
    }

    /**
     * Replace all direct overrides for a user.
     * grants = extra permissions; denies = blocked even if role has them.
     */
    async replaceOverrides(
        userId: string,
        grants: string[],
        denies: string[],
    ) {
        await Repository.db
            .delete(userPermissions)
            .where(eq(userPermissions.userId, userId));

        const denySet = new Set(denies);
        for (const id of grants) {
            if (denySet.has(id)) continue;
            await Repository.db
                .insert(userPermissions)
                .values({ userId, permissionId: id, effect: "grant" })
                .onConflictDoNothing();
        }
        for (const id of denySet) {
            await Repository.db
                .insert(userPermissions)
                .values({ userId, permissionId: id, effect: "deny" })
                .onConflictDoNothing();
        }
    }
}

export const userPermissionRepository =
    new UserPermissionRepository();
