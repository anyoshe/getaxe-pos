import type { ReactNode } from "react";

import type { CurrentUser } from "@/lib/auth/current-user";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: ReactNode;
  user: CurrentUser;
}

/**
 * Responsive ERP shell:
 * - Mobile / tablet (< lg): topbar + hamburger drawer, full-width content
 * - Desktop (lg+): fixed-width sidebar + content column
 */
export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex h-[100dvh] overflow-hidden bg-muted/50 dark:bg-slate-950">
      {/* Desktop / large tablet sidebar */}
      <div className="hidden h-full shrink-0 lg:flex">
        <Sidebar user={user} />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar user={user} />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
