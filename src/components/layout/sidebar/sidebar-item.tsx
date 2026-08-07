"use client";

import Link from "next/link";

import type {
  NavigationItem,
} from "@/config/navigation.types";


interface SidebarItemProps {
  item: NavigationItem;
  pathname: string;
}


export function SidebarItem({
  item,
  pathname,
}: SidebarItemProps) {

  const Icon = item.icon;

  const active =
    pathname === item.href ||
    pathname.startsWith(item.href! + "/");


  return (
    <Link
      href={item.href!}
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-sm
        font-medium
        transition-all
        duration-200

        ${
          active
            ? `
              scale-[1.02]
              bg-gradient-to-r
              from-indigo-600
              via-violet-600
              to-purple-600
              text-white
              shadow-xl
            `
            : `
              text-slate-600
              hover:translate-x-1
              hover:bg-white
              hover:text-indigo-700
              hover:shadow-md
            `
        }
      `}
    >

      <Icon size={20} />

      <span>
        {item.label}
      </span>

    </Link>
  );
}