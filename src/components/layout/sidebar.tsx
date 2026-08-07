"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { navigation } from "@/config/navigation";

import { Logo } from "./logo";

import type { CurrentUser } from "@/lib/auth/current-user";


import {
  SidebarExpandable,
  SidebarItem,
} from "./sidebar/index";

interface SidebarProps {
  user: CurrentUser;
}

export function Sidebar({
  user,
}: SidebarProps) {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    navigation.forEach((item) => {
      if (
        item.children?.some(
          (child) =>
            pathname === child.href ||
            pathname.startsWith(child.href! + "/")
        )
      ) {
        setOpenMenus((prev) =>
          prev.includes(item.label)
            ? prev
            : [...prev, item.label]
        );
      }
    });
  }, [pathname]);

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

        {navigation.map((item) => {

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