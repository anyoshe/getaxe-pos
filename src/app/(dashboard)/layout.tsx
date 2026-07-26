import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout";
import { getCurrentUser } from "@/lib/auth/current-user";


interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      {children}
    </AppShell>
  );
}