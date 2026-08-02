export interface PermissionDefinition {
  code: string;

  action: string;

  name: string;

  description: string;
}

export interface PermissionModuleDefinition {
  code: string;

  name: string;

  description: string;

  permissions: PermissionDefinition[];
}

export type PermissionRegistry =
  PermissionModuleDefinition[];