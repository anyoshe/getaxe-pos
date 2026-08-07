import type { ReactNode } from "react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

import type {
  CurrentUser,
} from "@/lib/auth/current-user";

interface AppShellProps {
  children: ReactNode;
  user: CurrentUser;
}

export function AppShell({
  children,
  user,
}: AppShellProps) {
  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <Sidebar user={user} />

      <div className="flex h-screen flex-col lg:pl-72">
        <Topbar user={user} />

        <main className="flex-1 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}