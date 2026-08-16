import { SYSTEM_ROLE_PERMISSIONS } from "@/features/permissions/constants";
import { permissionResolver } from "@/features/permissions/services/permission-resolver";

import { roleRepository } from "@/repositories/users/role.repository";
import { permissionRepository } from "@/repositories/users/permission.repository";
import { rolePermissionRepository } from "@/repositories/users/role-permission.repository";

export async function seedSystemRolePermissions() {
  console.log("Seeding system role permissions...");

  for (const [roleName, patterns] of Object.entries(
    SYSTEM_ROLE_PERMISSIONS,
  )) {
    const role = await roleRepository.findByName(roleName);

    if (!role) {
      console.warn(`Role not found: ${roleName}`);
      continue;
    }

    await rolePermissionRepository.removeAll(role.id);

    const permissionCodes =
      permissionResolver.resolve(patterns);

    let assigned = 0;

    for (const code of permissionCodes) {
      const permission =
        await permissionRepository.findByCode(code);

      if (!permission) {
        console.warn(
          `[${roleName}] Missing permission: ${code}`,
        );

        continue;
      }

      await rolePermissionRepository.assign(
        role.id,
        permission.id,
      );

      assigned++;
    }

    console.log(
      `${roleName}: ${assigned} permissions synchronized`,
    );
  }

  console.log("System role permissions seeded.");
}