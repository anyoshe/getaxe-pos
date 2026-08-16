import type { PermissionDefinition } from "./permission";
import type {
  PERMISSION_MODULES,
} from "../constants/permission-modules";

export type PermissionModuleCode =
  keyof typeof PERMISSION_MODULES;

export interface PermissionModule {
  code: PermissionModuleCode;
  name: string;
  description?: string;
  permissions: PermissionDefinition[];
}
