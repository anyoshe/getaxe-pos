import {
  PERMISSION_REGISTRY,
  type CanonicalPermissionCode,
} from "../catalogue";

type PermissionConstantTree = Readonly<
  Record<string, Readonly<Record<string, CanonicalPermissionCode>>>
>;

function toConstantKey(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

/**
 * Canonical permission constants derived from the catalogue.
 *
 * Example:
 *   PERMISSIONS.USERS.VIEW === "users.view"
 *   PERMISSIONS.SALES_PAYMENTS.RECEIVE === "sales.payments.receive"
 */
export const PERMISSIONS = Object.freeze(
  PERMISSION_REGISTRY.reduce<
    Record<string, Record<string, CanonicalPermissionCode>>
  >((modules, module) => {
    const moduleKey = module.code;

    modules[moduleKey] = {};

    for (const permission of module.permissions) {
      const actionKey = toConstantKey(
        permission.code
          .split(".")
          .at(-1) ?? permission.action,
      );

      modules[moduleKey][actionKey] =
        permission.code as CanonicalPermissionCode;
    }

    return modules;
  }, {}),
) as PermissionConstantTree;

export const ALL_PERMISSION_CODES =
  PERMISSION_REGISTRY.flatMap((module) =>
    module.permissions.map((permission) => permission.code),
  );
