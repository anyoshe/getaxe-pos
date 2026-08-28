import type { ReactNode } from "react";

import type { CurrentUser } from "@/lib/auth/current-user";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
  user: CurrentUser;
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Persistent left nav — stays mounted across client navigations */}
      <Sidebar user={user} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar user={user} />

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
