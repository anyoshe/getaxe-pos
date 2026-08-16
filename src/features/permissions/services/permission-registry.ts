import type {
  PermissionDefinition,
  PermissionModule,
} from "../types";

import {
  PERMISSION_REGISTRY,
} from "../catalogue";

const PERMISSION_MODULES =
  PERMISSION_REGISTRY satisfies readonly PermissionModule[];

export class PermissionRegistry {
  private readonly modules: readonly PermissionModule[];
  private readonly permissions: ReadonlyMap<
    string,
    PermissionDefinition
  >;

  constructor(
    modules: readonly PermissionModule[] = PERMISSION_MODULES,
  ) {
    this.modules = modules;

    const permissions = new Map<string, PermissionDefinition>();

    for (const permissionModule of modules) {
      for (const permission of permissionModule.permissions) {
        if (permissions.has(permission.code)) {
          throw new Error(
            `Duplicate permission code: ${permission.code}`,
          );
        }

        permissions.set(permission.code, permission);
      }
    }

    this.permissions = permissions;
  }

  getModules(): readonly PermissionModule[] {
    return this.modules;
  }

  getAll(): PermissionDefinition[] {
    return [...this.permissions.values()];
  }

  count(): number {
    return this.permissions.size;
  }

  has(code: string): boolean {
    return this.permissions.has(code);
  }

  get(code: string): PermissionDefinition | undefined {
    return this.permissions.get(code);
  }

  getModule(code: string): PermissionModule | undefined {
    return this.modules.find(
      (permissionModule) =>
        permissionModule.code === code,
    );
  }
}

export const permissionRegistry =
  new PermissionRegistry();
