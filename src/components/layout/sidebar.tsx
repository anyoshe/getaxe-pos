"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

import { navigation } from "@/config/navigation";
import { usePermission } from "@/providers/permissions-provider";
import { Logo } from "./logo";

import type { CurrentUser } from "@/lib/auth/current-user";
import type { NavigationItem } from "@/config/navigation.types";

import {
  SidebarExpandable,
  SidebarItem,
} from "./sidebar/index";

interface SidebarProps {
  user: CurrentUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Smart filtering: Show parent if ANY child is accessible
  const filteredNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        // If item has no children, just check its own permission
        if (!item.children || item.children.length === 0) {
          // If no permission required, show it
          if (!item.permission) return item;
          // Otherwise check permission
          return hasPermission(item.permission) ? item : null;
        }

        // For items with children, filter children first
        const visibleChildren = item.children.filter((child) => {
          // If child has no permission, show it
          if (!child.permission) return true;
          // Check if user has this specific permission OR module-level access
          return hasPermission(child.permission);
        });

        // If no children are visible, hide the parent
        if (visibleChildren.length === 0) {
          return null;
        }

        // Return the item with only visible children
        return {
          ...item,
          children: visibleChildren,
        };
      })
      .filter((item): item is NavigationItem => item !== null);
  }, [hasPermission]);

  useEffect(() => {
    filteredNavigation.forEach((item) => {
     if (
  pathname === item.href ||
  item.children?.some(
    (child) =>
      pathname === child.href ||
      pathname.startsWith(child.href! + "/")
  )
) {
        setOpenMenus((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label]
        );
      }
    });
  }, [pathname, filteredNavigation]);

  function toggleMenu(label: string) {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((x) => x !== label)
        : [...prev, label]
    );
  }

  return (
    <aside
      className="
        fixed
        inset-y-0
        left-0
        hidden
        w-72
        overflow-y-auto
        border-r
        border-slate-200
        bg-gradient-to-b
        from-slate-50
        via-white
        to-indigo-50/40
        lg:flex
        lg:flex-col
      "
    >
      {/* Header */}
      <div
        className="
          sticky
          top-0
          z-20
          border-b
          border-slate-200
          bg-white/95
          backdrop-blur-xl
        "
      >
        <div className="p-6">
          <Logo />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-5">
        {filteredNavigation.map((item) => {
          if (item.children) {
            return (
              <SidebarExpandable
                key={item.label}
                item={item}
                pathname={pathname}
                openMenus={openMenus}
                toggleMenu={toggleMenu}
              />
            );
          }

          return (
            <SidebarItem
              key={item.label}
              item={item}
              pathname={pathname}
            />
          );
        })}
      </nav>
    </aside>
  );
}