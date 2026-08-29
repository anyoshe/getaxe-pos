import { revalidatePath } from "next/cache";
"use server";

import { roleService } from "../services";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

export async function getRolesAction() {
  try {
    await requireAuthorizedUser("roles.view");
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
  data: Parameters<typeof roleService.createRole>[0],
) {
  try {
    await requireAuthorizedUser("roles.create");
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
  data: Parameters<typeof roleService.updateRole>[1],
) {
  try {
    await requireAuthorizedUser("roles.update");
    return {
      success: true,
      data: await roleService.updateRole(id, data),
      message: "Role updated successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update role",
    };
  }
}

export async function activateRoleAction(id: string) {
  await requireAuthorizedUser("roles.update");
  return roleService.activateRole(id);
}

export async function deactivateRoleAction(id: string) {
  await requireAuthorizedUser("roles.update");
  return roleService.deactivateRole(id);
}

export async function deleteRoleAction(id: string) {
  try {
    await requireAuthorizedUser("roles.delete");

    await roleService.deleteRole(id);

    return {
      success: true,
      message: "Role deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
}

export async function getRolePermissionsAction(roleId: string) {
  try {
    await requireAuthorizedUser("roles.view");

    return {
      success: true,
      data: await roleService.getRolePermissions(roleId),
    };
  } catch {
    return {
      success: false,
      message: "Failed to load role permissions",
    };
  }
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissionIds: string[],
) {
  try {
    await requireAuthorizedUser("roles.update");

    await roleService.replacePermissions(roleId, permissionIds);
    revalidatePath("/settings/roles");
    revalidatePath("/settings/users");

    return {
      success: true,
      message: "Permissions updated successfully",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update permissions",
    };
  }
}

export async function getRoleUsersAction(roleId: string) {
  try {
    await requireAuthorizedUser("roles.view");

    return {
      success: true,
      data: await roleService.getRoleUsers(roleId),
    };
  } catch {
    return {
      success: false,
      message: "Failed to load assigned users",
    };
  }
}
