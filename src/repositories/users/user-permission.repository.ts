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

        const combined = [
            ...rolePermissionsResult,
            ...directPermissionsResult,
        ];

        const uniquePermissions = new Map(
            combined.map(
                (permission) => [
                    permission.id,
                    permission,
                ],
            ),
        );

        return Array.from(
            uniquePermissions.values(),
        ).sort(
            (a, b) =>
                a.module.localeCompare(b.module) ||
                a.code.localeCompare(b.code),
        );
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
     * Assign a permission directly to a user.
     *
     * The composite primary key on user_permissions
     * prevents duplicate assignments.
     */
    async assignDirectPermission(
        userId: string,
        permissionId: string,
    ) {

        return Repository.db
            .insert(userPermissions)
            .values({
                userId,
                permissionId,
            })
            .onConflictDoNothing();
    }


    /**
     * Remove a direct permission from a user.
     */
    async removeDirectPermission(
        userId: string,
        permissionId: string,
    ) {

        return Repository.db
            .delete(userPermissions)
            .where(
                and(
                    eq(
                        userPermissions.userId,
                        userId,
                    ),
                    eq(
                        userPermissions.permissionId,
                        permissionId,
                    ),
                ),
            );
    }


    /**
     * Return only permissions directly assigned
     * to the user.
     */
    async getDirectPermissions(
        userId: string,
    ) {

        return Repository.db
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
            )
            .orderBy(
                permissions.module,
                permissions.code,
            );
    }

}

export const userPermissionRepository =
    new UserPermissionRepository();
