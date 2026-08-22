import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { rolePermissionService } from "@/services/security/role-permission.service";
import { PermissionsProvider } from "@/providers/permissions-provider";

/**
 * Minimal shell for full-screen POS — no sidebar/chrome.
 */
export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const userPermissions = await rolePermissionService.getUserPermissions(
    user.id,
  );
  const permissionCodes = userPermissions.map((p) => p.code);

  return (
    <PermissionsProvider permissions={permissionCodes}>
      <div className="min-h-dvh bg-background text-foreground">{children}</div>
    </PermissionsProvider>
  );
}
