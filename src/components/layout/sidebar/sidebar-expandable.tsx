"use client";

import { ChevronDown } from "lucide-react";

import type {
  NavigationItem,
} from "@/config/navigation.types";

import {
  SidebarItem,
} from "./sidebar-item";


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

  const Icon = item.icon;

  const open =
    openMenus.includes(item.label);


  return (
    <div className="space-y-2">

      <button
        type="button"
        onClick={() => toggleMenu(item.label)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          px-3
          py-3
          font-semibold
          text-slate-700
          transition
          hover:bg-slate-100
        "
      >

        <div className="flex items-center gap-3">

          <Icon size={20} />

          <span>
            {item.label}
          </span>

        </div>


        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-200
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />

      </button>


      <div
        className={`
          ml-5
          overflow-hidden
          border-l-2
          border-slate-200
          pl-4
          transition-all
          duration-300

          ${
            open
              ? "max-h-96 space-y-2 pt-2"
              : "max-h-0 space-y-0"
          }
        `}
      >

        {item.children?.map((child) => (

          <SidebarItem
            key={child.label}
            item={child}
            pathname={pathname}
          />

        ))}

      </div>

    </div>
  );
}