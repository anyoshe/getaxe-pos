"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users, LogOut } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/platform", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/platform/business-owners", label: "Business owners", icon: Users },
  { href: "/platform/businesses", label: "Businesses", icon: Building2 },
];

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="brand-gradient sticky top-0 z-40 text-primary-foreground shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card/20 text-xs font-black">
              GA
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight sm:text-base">
                GetAxe Platform
              </div>
              <div className="text-[10px] text-white/75">
                Client onboarding & tenant administration
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="rounded-lg bg-card/15 text-white hover:bg-card/25 hover:text-white" />
            <Link
              href="/platform/login"
              className="inline-flex items-center gap-1 rounded-lg bg-card/15 px-3 py-2 text-xs font-medium hover:bg-card/25"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit
            </Link>
          </div>
        </div>
        <nav className="border-t border-white/10 bg-black/10">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 sm:px-6">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-[oklch(0.70_0.14_85)] text-white"
                      : "border-transparent text-white/70 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
