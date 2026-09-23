import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { rolePermissionService } from "@/services/security/role-permission.service";
import { AppShell } from "@/components/layout/app-shell";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { CapabilitiesProvider } from "@/providers/capabilities-provider";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [userPermissions, enabledCapabilities] = await Promise.all([
    rolePermissionService.getUserPermissions(user.id),
    new BusinessCapabilityRepository()
      .listEnabled(user.businessId)
      .catch(() => [] as string[]),
  ]);

  const permissionCodes = userPermissions.map((p) => p.code);

  return (
    <PermissionsProvider permissions={permissionCodes}>
      <CapabilitiesProvider capabilities={enabledCapabilities}>
        <AppShell user={user}>{children}</AppShell>
      </CapabilitiesProvider>
    </PermissionsProvider>
  );
}
