"use client";

import Link from "next/link";

import type { NavigationItem } from "@/config/navigation.types";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  item: NavigationItem;
  pathname: string;
  /** Nested under a module group */
  nested?: boolean;
}

export function SidebarItem({
  item,
  pathname,
  nested = false,
}: SidebarItemProps) {
  const Icon = item.icon;
  const href = item.href ?? "#";
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 transition-colors",
        nested ? "py-1.5" : "py-2",
        active
          ? "bg-primary/12 text-primary font-medium"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white",
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "shrink-0 opacity-80",
            nested ? "h-4 w-4" : "h-[18px] w-[18px]",
            active && "opacity-100 text-primary",
          )}
          strokeWidth={1.75}
        />
      ) : null}
      <span
        className={cn(
          "truncate leading-none tracking-tight",
          nested ? "text-[13px] font-normal" : "text-sm font-medium",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
