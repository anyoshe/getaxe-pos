import { permissionRegistry } from "./permission-registry";

export class PermissionResolver {
  /**
   * Returns every canonical permission code.
   */
  getAllCodes(): string[] {
    return permissionRegistry
      .getAll()
      .map((permission) => permission.code);
  }

  /**
   * Expands a permission pattern against the canonical registry.
   *
   * Supported patterns:
   *   "*"                -> every permission
   *   "products.*"      -> every products permission
   *   "products.create" -> exact permission
   */
  expand(pattern: string): string[] {
    const normalized = pattern.trim();

    if (!normalized) {
      return [];
    }

    if (normalized === "*") {
      return this.getAllCodes();
    }

    if (normalized.endsWith(".*")) {
      const prefix = normalized.slice(0, -1);

      return this.getAllCodes().filter((code) =>
        code.startsWith(prefix),
      );
    }

    return permissionRegistry.has(normalized)
      ? [normalized]
      : [];
  }

  /**
   * Resolves multiple permission patterns into
   * a unique, sorted list of canonical permission codes.
   */
  resolve(patterns: readonly string[]): string[] {
    const permissions = patterns.flatMap((pattern) =>
      this.expand(pattern),
    );

    return [...new Set(permissions)].sort();
  }

  /**
   * Checks whether a permission pattern resolves
   * to at least one canonical permission.
   */
  isValidPattern(pattern: string): boolean {
    return this.expand(pattern).length > 0;
  }
}

export const permissionResolver =
  new PermissionResolver();
