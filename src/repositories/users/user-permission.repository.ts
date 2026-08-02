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
    permissions,
} from "@/db/schema/users/permissions";


export class UserPermissionRepository {


    async hasPermission(
        userId: string,
        permissionCode: string,
    ) {
        const result =
            await Repository.db
                .select({
                    permission: permissions.code,
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
                            permissions.code,
                            permissionCode,
                        ),
                    ),
                )
                .limit(1);


        return result.length > 0;
    }


    async getUserPermissions(
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
                eq(
                    users.id,
                    userId,
                ),
            );
    }


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


}


export const userPermissionRepository =
    new UserPermissionRepository();