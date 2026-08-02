"use server";

import {
    permissionService,
} from "../services";

import {
    requireAuthorizedUser,
} from "@/lib/auth/authorize";

export async function getPermissionsAction() {
    try {
        await requireAuthorizedUser(
            "permissions.view"
        );
        return {
            success: true,
            data: await permissionService.getPermissions(),
        };
    } catch {
        return {
            success: false,
            message: "Failed to load permissions",
        };
    }
}


export async function getPermissionAction(
    id: string,
) {
    await requireAuthorizedUser(
        "permissions.view"
    );
    return permissionService.getPermission(id);
}


export async function upsertPermissionAction(
    data: {
        code: string;
        module: string;
        name: string;
        description: string | null;
    },
) {
    try {

        await requireAuthorizedUser(
            "roles.assign_permissions"
        );
        return {
            success: true,
            data: await permissionService.upsertPermission(data),
            message: "Permission saved successfully",
        };
    } catch {
        return {
            success: false,
            message: "Failed to save permission",
        };
    }
}


export async function activatePermissionAction(
    id: string,
) {
     await requireAuthorizedUser(
            "roles.assign_permissions"
        );
    return permissionService.activatePermission(id);
}


export async function deactivatePermissionAction(
    id: string,
) {
     await requireAuthorizedUser(
            "roles.assign_permissions"
        );
    return permissionService.deactivatePermission(id);
}


export async function deletePermissionAction(
    id: string,
) {
     await requireAuthorizedUser(
            "roles.assign_permissions"
        );
    return permissionService.deletePermission(id);
}