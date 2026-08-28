"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import type { NavigationItem } from "@/config/navigation.types";
import { cn } from "@/lib/utils";

import { SidebarItem } from "./sidebar-item";

interface SidebarExpandableProps {
  item: NavigationItem;
  pathname: string;
  openMenus: string[];
  toggleMenu: (label: string) => void;
}

export function SidebarExpandable({
  item,
  pathname,
  openMenus,
  toggleMenu,
}: SidebarExpandableProps) {
  const router = useRouter();
  const Icon = item.icon;
  const open = openMenus.includes(item.label);

  const childActive = item.children?.some(
    (child) =>
      child.href &&
      (pathname === child.href || pathname.startsWith(child.href + "/")),
  );

  const active = Boolean(
    childActive ||
      (item.href &&
        (pathname === item.href || pathname.startsWith(item.href + "/"))),
  );

  function handleClick() {
    toggleMenu(item.label);
    if (item.href) {
      router.push(item.href);
    }
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <Icon
              className={cn(
                "h-[18px] w-[18px] shrink-0 opacity-80",
                active && "text-primary opacity-100",
              )}
              strokeWidth={1.75}
            />
          ) : null}
          <span className="truncate text-sm font-medium leading-none tracking-tight">
            {item.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
            active && "text-primary/70",
          )}
          strokeWidth={1.75}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-3 space-y-0.5 border-l border-slate-200 py-1 pl-2.5 dark:border-slate-700">
            {item.children?.map((child) => (
              <SidebarItem
                key={child.href ?? child.label}
                item={child}
                pathname={pathname}
                nested
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
