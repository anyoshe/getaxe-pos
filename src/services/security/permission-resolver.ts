import { PERMISSION_REGISTRY } from "@/constants/permissions";

export class PermissionResolver {
    static getAllCodes(): string[] {
        return PERMISSION_REGISTRY.flatMap((module) =>
            module.permissions.map((permission) => permission.code)
        );
    }

    static expand(
        pattern: string
    ): string[] {
        if (pattern === "*") {
            return this.getAllCodes();
        }

        if (pattern.endsWith(".*")) {
            const prefix = pattern.slice(0, -1);

            return this.getAllCodes().filter(
                (code) => code.startsWith(prefix)
            );
        }

        return [pattern];
    }

    static resolve(
        patterns: readonly string[]
    ): string[] {
        const permissions = patterns.flatMap(
            (pattern) => this.expand(pattern)
        );

        return [...new Set(permissions)].sort();
    }
}

export const permissionResolver =
    new PermissionResolver();