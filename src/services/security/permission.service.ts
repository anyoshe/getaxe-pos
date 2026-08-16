import {
  permissionRegistry,
} from "@/features/permissions/services/permission-registry";

import type {
  PermissionDefinition,
  PermissionModule,
} from "@/features/permissions/types";

export class PermissionService {
  getModules(): readonly PermissionModule[] {
    return permissionRegistry.getModules();
  }

  getModule(
    code: string,
  ): PermissionModule | undefined {
    return permissionRegistry.getModule(code);
  }

  getAllPermissions(): PermissionDefinition[] {
    return permissionRegistry.getAll();
  }

  getPermission(
    code: string,
  ): PermissionDefinition | undefined {
    return permissionRegistry.get(code);
  }

  getModulePermissions(
    moduleCode: string,
  ): PermissionDefinition[] {
    return (
      this.getModule(moduleCode)?.permissions ?? []
    );
  }

  permissionExists(
    code: string,
  ): boolean {
    return permissionRegistry.has(code);
  }

  searchPermissions(
    query: string,
  ): PermissionDefinition[] {
    const search = query.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return this.getAllPermissions().filter(
      (permission) =>
        permission.code
          .toLowerCase()
          .includes(search) ||
        permission.name
          .toLowerCase()
          .includes(search) ||
        (permission.description ?? "")
          .toLowerCase()
          .includes(search),
    );
  }
}

export const permissionService =
  new PermissionService();
