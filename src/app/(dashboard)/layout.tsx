import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { rolePermissionService } from "@/services/security/role-permission.service";
import { AppShell } from "@/components/layout/app-shell";
import { PermissionsProvider } from "@/providers/permissions-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch effective permission objects & extract codes
  const userPermissions = await rolePermissionService.getUserPermissions(user.id);
  const permissionCodes = userPermissions.map((p) => p.code);

   // Debug: Log what permissions the admin has
  console.log("👤 User:", user.email);
  console.log("🔑 Permission Codes:", permissionCodes);
  console.log("📊 Count:", permissionCodes.length);

  return (
    <PermissionsProvider permissions={permissionCodes}>
      <AppShell user={user}>{children}</AppShell>
    </PermissionsProvider>
  );
}