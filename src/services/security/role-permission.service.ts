import { rolePermissionRepository } from "@/repositories";

import {
    userPermissionRepository,
} from "@/repositories";

export class RolePermissionService {

    async getRolePermissions(roleId: string) {
        const permissions =
            await rolePermissionRepository.findByRole(roleId);

        return permissions;
    }


    async assignPermission(
        roleId: string,
        permissionId: string
    ) {
        const exists =
            await rolePermissionRepository.exists(
                roleId,
                permissionId
            );

        if (exists) {
            return {
                success: false,
                message: "Permission already assigned to role",
            };
        }

        const assignment =
            await rolePermissionRepository.assign(
                roleId,
                permissionId
            );

        return {
            success: true,
            data: assignment,
        };
    }

    async removePermission(
        roleId: string,
        permissionId: string
    ) {
        const exists =
            await rolePermissionRepository.exists(
                roleId,
                permissionId
            );

        if (!exists) {
            return {
                success: false,
                message: "Permission is not assigned to role",
            };
        }

        await rolePermissionRepository.remove(
            roleId,
            permissionId
        );

        return {
            success: true,
            message: "Permission removed successfully",
        };
    }

    async hasPermission(
        userId: string,
        permissionCode: string
    ) {
        return userPermissionRepository.hasPermission(
            userId,
            permissionCode
        );
    }

    async getUserPermissions(
        userId: string
    ) {
        return userPermissionRepository.getUserPermissions(
            userId
        );
    }
}

export const rolePermissionService =
    new RolePermissionService();