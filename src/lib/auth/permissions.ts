import "server-only";

import {
  rolePermissionService,
} from "@/services/security/role-permission.service";

import {
  requireCurrentUser,
} from "./current-user";


export async function hasPermission(
  permissionCode: string
) {
  const user = await requireCurrentUser();

  return rolePermissionService.hasPermission(
    user.id,
    permissionCode
  );
}


export async function requirePermission(
  permissionCode: string
) {
  const allowed =
    await hasPermission(permissionCode);

  if (!allowed) {
    throw new Error(
      `Missing permission: ${permissionCode}`
    );
  }

  return true;
}