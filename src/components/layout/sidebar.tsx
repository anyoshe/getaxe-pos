"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { navigation } from "@/config/navigation";
import { usePermission } from "@/providers/permissions-provider";
import { useCapability } from "@/providers/capabilities-provider";
import type { CurrentUser } from "@/lib/auth/current-user";
import type { NavigationItem } from "@/config/navigation.types";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { SidebarExpandable, SidebarItem } from "./sidebar/index";

interface SidebarProps {
  user: CurrentUser;
}

const SECTION_BREAKS: Record<string, string> = {
  Dashboard: "",
  Capabilities: "",
  Sales: "Commerce",
  Inventory: "Commerce",
  Purchasing: "Commerce",
  CRM: "Commerce",
  Finance: "Finance & insight",
  Reports: "Finance & insight",
  Operations: "Administration",
  Settings: "Administration",
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const { hasCapability, hasAnyCapability } = useCapability();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  function capOk(item: NavigationItem) {
    if (item.capability && !hasCapability(item.capability)) return false;
    if (item.anyCapabilities?.length && !hasAnyCapability(item.anyCapabilities))
      return false;
    return true;
  }

  const filteredNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        if (!item.children || item.children.length === 0) {
          if (item.permission && !hasPermission(item.permission)) return null;
          if (!capOk(item)) return null;
          return item;
        }

        const visibleChildren = item.children.filter((child) => {
          if (child.permission && !hasPermission(child.permission)) return false;
          if (!capOk(child)) return false;
          return true;
        });

        if (visibleChildren.length === 0) return null;

        return { ...item, children: visibleChildren };
      })
      .filter((item): item is NavigationItem => item !== null);
  }, [hasPermission, hasCapability, hasAnyCapability]);

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      for (const item of filteredNavigation) {
        const match =
          (item.href &&
            (pathname === item.href ||
              pathname.startsWith(item.href + "/"))) ||
          item.children?.some(
            (child) =>
              child.href &&
              (pathname === child.href ||
                pathname.startsWith(child.href + "/")),
          );
        if (match) next.add(item.label);
      }
      return Array.from(next);
    });
  }, [pathname, filteredNavigation]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label],
    );
  }

  // Build rows with section headers without mutating during render
  const rows = useMemo(() => {
    const result: Array<
      | { type: "section"; label: string }
      | { type: "item"; item: NavigationItem }
    > = [];
    let lastSection = "";
    for (const item of filteredNavigation) {
      const section = SECTION_BREAKS[item.label] ?? "";
      if (section && section !== lastSection) {
        result.push({ type: "section", label: section });
        lastSection = section;
      }
      result.push({ type: "item", item });
    }
    return result;
  }, [filteredNavigation]);

  const businessLabel =
    (user as { business?: { name?: string | null } | null }).business?.name ??
    user.name ??
    "Workspace";

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] shrink-0 flex-col border-r border-border/80 xl:w-[260px]",
        "bg-muted/50/95 text-foreground",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100",
      )}
    >
      <div className="shrink-0 border-b border-border/80 px-5 py-4 dark:border-slate-800">
        <Logo />
        <p className="mt-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground">
          {businessLabel}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {rows.map((row) => {
          if (row.type === "section") {
            return (
              <div key={`section-${row.label}`} className="mb-1.5 mt-4 px-2.5 first:mt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {row.label}
                </p>
              </div>
            );
          }

          const item = row.item;
          return item.children && item.children.length > 0 ? (
            <SidebarExpandable
              key={item.label}
              item={item}
              pathname={pathname}
              openMenus={openMenus}
              toggleMenu={toggleMenu}
            />
          ) : (
            <SidebarItem key={item.label} item={item} pathname={pathname} />
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border/80 px-4 py-3 dark:border-slate-800">
        <p className="truncate text-[11px] text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-muted-foreground dark:text-muted-foreground">
            {user.name ?? user.email}
          </span>
        </p>
      </div>
    </aside>
  );
}
