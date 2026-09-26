import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getEnabledCapabilitiesCached,
  getUserPermissionCodesCached,
} from "@/lib/auth/request-cache";
import { AppShell } from "@/components/layout/app-shell";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { CapabilitiesProvider } from "@/providers/capabilities-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [permissionCodes, enabledCapabilities] = await Promise.all([
    getUserPermissionCodesCached(user.id),
    getEnabledCapabilitiesCached(user.businessId),
  ]);

  return (
    <PermissionsProvider permissions={permissionCodes}>
      <CapabilitiesProvider capabilities={enabledCapabilities}>
        <AppShell user={user}>{children}</AppShell>
      </CapabilitiesProvider>
    </PermissionsProvider>
  );
}
