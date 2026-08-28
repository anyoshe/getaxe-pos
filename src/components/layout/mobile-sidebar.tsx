"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";

import { navigation } from "@/config/navigation";
import { usePermission } from "@/providers/permissions-provider";
import type { NavigationItem } from "@/config/navigation.types";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { Logo } from "./logo";

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

export function MobileSidebar() {
  const pathname = usePathname();
  const { hasPermission } = usePermission();
  const [open, setOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const filteredNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        if (!item.children || item.children.length === 0) {
          if (!item.permission) return item;
          return hasPermission(item.permission) ? item : null;
        }
        const visibleChildren = item.children.filter((child) => {
          if (!child.permission) return true;
          return hasPermission(child.permission);
        });
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      })
      .filter((item): item is NavigationItem => item !== null);
  }, [hasPermission]);

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      for (const item of filteredNavigation) {
        const match =
          (item.href &&
            (pathname === item.href ||
              pathname.startsWith(item.href + "/"))) ||
          item.children?.some(
            (c) =>
              c.href &&
              (pathname === c.href || pathname.startsWith(c.href + "/")),
          );
        if (match) next.add(item.label);
      }
      return Array.from(next);
    });
  }, [pathname, filteredNavigation]);

  // Close drawer after route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label],
    );
  }

  let lastSection = "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 border-slate-200 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-[min(100vw-3rem,20rem)] flex-col gap-0 p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b border-slate-200 px-4 py-4 text-left dark:border-slate-800">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
        </SheetHeader>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {filteredNavigation.map((item) => {
            const section = SECTION_BREAKS[item.label] ?? "";
            const showSection = Boolean(section && section !== lastSection);
            if (section) lastSection = section;

            const Icon = item.icon;
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openMenus.includes(item.label);
            const parentActive =
              (item.href &&
                (pathname === item.href ||
                  pathname.startsWith(item.href + "/"))) ||
              item.children?.some(
                (c) =>
                  c.href &&
                  (pathname === c.href ||
                    pathname.startsWith(c.href + "/")),
              );

            return (
              <div key={item.label}>
                {showSection ? (
                  <div className="mb-1.5 mt-4 px-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {section}
                    </p>
                  </div>
                ) : null}

                {hasChildren ? (
                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium tracking-tight transition-colors",
                        parentActive
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        {Icon ? (
                          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        ) : null}
                        <span className="truncate">{item.label}</span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <div className="ml-3 space-y-0.5 border-l border-slate-200 py-1 pl-2.5 dark:border-slate-700">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          const href = child.href ?? "#";
                          const active =
                            pathname === href ||
                            pathname.startsWith(href + "/");
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] tracking-tight transition-colors",
                                active
                                  ? "bg-primary/12 font-medium text-primary"
                                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300",
                              )}
                            >
                              {ChildIcon ? (
                                <ChildIcon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                              ) : null}
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium tracking-tight transition-colors",
                      pathname === item.href ||
                        pathname.startsWith(item.href + "/")
                        ? "bg-primary/12 text-primary"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300",
                    )}
                  >
                    {Icon ? (
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                    ) : null}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : null}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
