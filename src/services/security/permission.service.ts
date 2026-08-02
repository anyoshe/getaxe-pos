import { PERMISSION_REGISTRY } from "@/constants/permissions";

import type {
  PermissionDefinition,
  PermissionModuleDefinition,
} from "./permission.types";

export class PermissionService {
  static getModules(): PermissionModuleDefinition[] {
    return PERMISSION_REGISTRY;
  }

  static getModule(
    code: string
  ): PermissionModuleDefinition | undefined {
    return PERMISSION_REGISTRY.find(
      (module) => module.code === code
    );
  }

  static getAllPermissions(): PermissionDefinition[] {
    return PERMISSION_REGISTRY.flatMap(
      (module) => module.permissions
    );
  }

  static getPermission(
    code: string
  ): PermissionDefinition | undefined {
    return this.getAllPermissions().find(
      (permission) => permission.code === code
    );
  }

  static getModulePermissions(
    moduleCode: string
  ): PermissionDefinition[] {
    return (
      this.getModule(moduleCode)?.permissions ?? []
    );
  }

  static permissionExists(
    code: string
  ): boolean {
    return this.getPermission(code) !== undefined;
  }

  static searchPermissions(
    query: string
  ): PermissionDefinition[] {
    const search = query.toLowerCase();

    return this.getAllPermissions().filter(
      (permission) =>
        permission.code
          .toLowerCase()
          .includes(search) ||
        permission.name
          .toLowerCase()
          .includes(search) ||
        permission.description
          .toLowerCase()
          .includes(search)
    );
  }
}
export const permissionService =
  new PermissionService();