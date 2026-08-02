"use server";

import {
    roleService,
} from "../services";

import {
    requireAuthorizedUser,
} from "@/lib/auth/authorize";

export async function getRolesAction() {
    try {
        await requireAuthorizedUser(
            "roles.view"
        );
        return {
            success: true,
            data: await roleService.getRoles(),
        };
    } catch {
        return {
            success: false,
            message: "Failed to load roles",
        };
    }
}


export async function createRoleAction(
    data: Parameters<
        typeof roleService.createRole
    >[0],
) {
    try {

        await requireAuthorizedUser(
            "roles.create"
        );
        return {
            success: true,
            data: await roleService.createRole(data),
            message: "Role created successfully",
        };
    } catch {
        return {
            success: false,
            message: "Failed to create role",
        };
    }
}


export async function updateRoleAction(
    id: string,
    data: Parameters<
        typeof roleService.updateRole
    >[1],
) {
    try {
        await requireAuthorizedUser(
            "roles.update"
        );
        return {
            success: true,
            data: await roleService.updateRole(
                id,
                data,
            ),
            message: "Role updated successfully",
        };
    } catch {
        return {
            success: false,
            message: "Failed to update role",
        };
    }
}


export async function activateRoleAction(
    id: string,
) {
    await requireAuthorizedUser(
        "roles.update"
    );
    return roleService.activateRole(id);
}


export async function deactivateRoleAction(
    id: string,
) {
    await requireAuthorizedUser(
        "roles.update"
    );
    return roleService.deactivateRole(id);
}


export async function deleteRoleAction(
    id: string,
) {
    await requireAuthorizedUser(
        "roles.delete"
    );
    return roleService.deleteRole(id);
}