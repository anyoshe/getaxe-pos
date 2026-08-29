import { SYSTEM_ROLE_PERMISSIONS } from "@/features/permissions/constants";
import { permissionResolver } from "@/features/permissions/services/permission-resolver";

import { roleRepository } from "@/repositories/users/role.repository";
import { permissionRepository } from "@/repositories/users/permission.repository";
import { rolePermissionRepository } from "@/repositories/users/role-permission.repository";

/**
 * Seed default permissions onto system roles.
 *
 * By default only fills roles that currently have ZERO permissions so an
 * administrator's customizations (extra cashier rights, reduced manager rights)
 * are never wiped on re-seed. Pass force=true to reset to catalogue defaults.
 */
export async function seedSystemRolePermissions(options?: { force?: boolean }) {
  const force = options?.force === true;
  console.log(
    force
      ? "Force-seeding system role permissions..."
      : "Seeding system role permissions (empty roles only)...",
  );

  for (const [roleName, patterns] of Object.entries(
    SYSTEM_ROLE_PERMISSIONS,
  )) {
    const role = await roleRepository.findByName(roleName);

    if (!role) {
      console.warn(`Role not found: ${roleName}`);
      continue;
    }

    const existing = await rolePermissionRepository.findByRole(role.id);
    if (!force && existing.length > 0) {
      console.log(
        `${roleName}: skipped (${existing.length} permissions already assigned — admin customizations preserved)`,
      );
      continue;
    }

    await rolePermissionRepository.removeAll(role.id);

    const permissionCodes = permissionResolver.resolve(patterns);

    let assigned = 0;

    for (const code of permissionCodes) {
      const permission = await permissionRepository.findByCode(code);

      if (!permission) {
        console.warn(`[${roleName}] Missing permission: ${code}`);
        continue;
      }

      await rolePermissionRepository.assign(role.id, permission.id);
      assigned++;
    }

    console.log(`${roleName}: ${assigned} permissions synchronized`);
  }

  console.log("System role permissions seeded.");
}
