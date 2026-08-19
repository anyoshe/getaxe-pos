"use client";

import React, { createContext, useContext, useMemo } from "react";

interface PermissionsContextValue {
  permissions: Set<string>;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (codes: string[]) => boolean;
  hasAllPermissions: (codes: string[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Check if a permission code matches a pattern with wildcard support
 * Examples:
 *   "sales.*" matches "sales.create", "sales.view", "sales.void"
 *   "users.*" matches "users.manage", "users.view"
 *   "sales.create" matches exactly "sales.create"
 */
function matchesPermission(permissionCode: string, pattern: string): boolean {
  // Exact match
  if (permissionCode === pattern) {
    return true;
  }
  
  // Wildcard pattern (e.g., "sales.*")
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2); // Remove ".*"
    return permissionCode.startsWith(prefix + ".");
  }
  
  return false;
}

export function PermissionsProvider({
  permissions = [],
  children,
}: {
  permissions: string[];
  children: React.ReactNode;
}) {
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const value = useMemo(
    () => ({
      permissions: permissionSet,
      hasPermission: (code: string) => {
        // Check exact match first
        if (permissionSet.has(code)) {
          return true;
        }
        
        // Check wildcard patterns
        // A user might have "sales.*" and we're checking "sales.create"
        for (const userPermission of permissionSet) {
          if (matchesPermission(code, userPermission)) {
            return true;
          }
        }
        
        return false;
      },
      hasAnyPermission: (codes: string[]) =>
        codes.some((code) => value.hasPermission(code)),
      hasAllPermissions: (codes: string[]) =>
        codes.every((code) => value.hasPermission(code)),
    }),
    [permissionSet]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermission must be used within a PermissionsProvider");
  }
  return context;
}