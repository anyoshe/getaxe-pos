import type { PermissionAction } from "../constants/permission-actions";

export interface PermissionDefinition {
  code: string;
  action: PermissionAction;
  name: string;
  description?: string;
}