import {
  PERMISSION_ACTION_VALUES,
} from "../constants/permission-actions";
import {
  SYSTEM_ROLE_PERMISSIONS,
} from "../constants/system-role-permissions";
import {
  permissionRegistry,
} from "./permission-registry";
import {
  permissionResolver,
} from "./permission-resolver";
import {
  CAPABILITIES,
} from "@/features/capabilities/constants/capabilities";

export interface PermissionValidationResult {
  valid: boolean;
  errors: string[];
}

const CODE_PATTERN =
  /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export function validatePermissions(): PermissionValidationResult {
  const errors: string[] = [];
  const modules = permissionRegistry.getModules();
  const moduleCodes = new Set<string>();
  const permissionCodes = new Set<string>();
  const actions = new Set<string>(PERMISSION_ACTION_VALUES);

  for (const permissionModule of modules) {
    if (moduleCodes.has(permissionModule.code)) {
      errors.push(
        `Duplicate module code: ${permissionModule.code}`,
      );
    }

    moduleCodes.add(permissionModule.code);

    for (const permission of permissionModule.permissions) {
      if (permissionCodes.has(permission.code)) {
        errors.push(
          `Duplicate permission code: ${permission.code}`,
        );
      }

      permissionCodes.add(permission.code);

      if (!CODE_PATTERN.test(permission.code)) {
        errors.push(
          `Invalid permission code format: ${permission.code}`,
        );
      }

      if (!actions.has(permission.action)) {
        errors.push(
          `Invalid permission action for ${permission.code}: ${permission.action}`,
        );
      }
    }
  }

  for (const [role, patterns] of Object.entries(
    SYSTEM_ROLE_PERMISSIONS,
  )) {
    for (const pattern of patterns) {
      if (!permissionResolver.isValidPattern(pattern)) {
        errors.push(
          `Invalid permission pattern for ${role}: ${pattern}`,
        );
      }
    }
  }

  for (const capability of CAPABILITIES) {
    for (const permission of capability.permissions) {
      if (!permissionRegistry.has(permission)) {
        errors.push(
          `Invalid capability permission for ${capability.code}: ${permission}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
