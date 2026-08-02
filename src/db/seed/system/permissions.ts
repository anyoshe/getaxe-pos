import { PERMISSION_REGISTRY } from "@/constants/permissions";
import { permissionRepository } from "@/repositories";

export async function seedSystemPermissions() {
  console.log("Seeding system permissions...");

  let total = 0;

  for (const permissionModule of PERMISSION_REGISTRY) {
    for (const permission of permissionModule.permissions) {
      await permissionRepository.upsert({
        code: permission.code,
        module: permissionModule.code,
        name: permission.name,
        description: permission.description ?? null,
      });

      total++;
    }
  }

  console.log(
    `System permissions synchronized (${total} permissions).`
  );
}