"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  Menu,
} from "lucide-react";

import { navigation } from "@/config/navigation";
import { usePermission } from "@/providers/permissions-provider";
import { Logo } from "./logo";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";


export function MobileSidebar() {

  const pathname = usePathname();

  const { hasPermission } =
    usePermission();


  const [open, setOpen] =
    useState(false);

  const [openMenus, setOpenMenus] =
    useState<string[]>([]);


  /*
   * Filter navigation according
   * to the user's permissions.
   *
   * A parent remains visible when
   * at least one child is accessible.
   */
  const filteredNavigation =
    useMemo(() => {

      return navigation

        .map((item) => {

          /*
           * Items without children.
           */
          if (
            !item.children ||
            item.children.length === 0
          ) {

            if (!item.permission) {
              return item;
            }

            return hasPermission(
              item.permission
            )
              ? item
              : null;
          }


          /*
           * Filter children according
           * to permissions.
           */
          const visibleChildren =
            item.children.filter(
              (child) => {

                if (!child.permission) {
                  return true;
                }

                return hasPermission(
                  child.permission
                );
              }
            );


          /*
           * Hide parent when none of
           * its children are accessible.
           */
          if (
            visibleChildren.length === 0
          ) {
            return null;
          }


          return {
            ...item,
            children:
              visibleChildren,
          };

        })

        .filter(
          (
            item
          ): item is typeof navigation[0] =>
            item !== null
        );

    }, [hasPermission]);


  /*
   * Automatically open the menu
   * containing the current route.
   */
  useEffect(() => {

    filteredNavigation.forEach(
      (item) => {

        const parentActive =
          item.href &&
          (
            pathname === item.href ||
            pathname.startsWith(
              item.href + "/"
            )
          );


        const childActive =
          item.children?.some(
            (child) =>
              child.href &&
              (
                pathname === child.href ||
                pathname.startsWith(
                  child.href + "/"
                )
              )
          );


        if (
          parentActive ||
          childActive
        ) {

          setOpenMenus((prev) =>
            prev.includes(item.label)
              ? prev
              : [
                  ...prev,
                  item.label,
                ]
          );

        }

      }
    );

  }, [
    pathname,
    filteredNavigation,
  ]);


  function toggleMenu(
    label: string
  ) {

    setOpenMenus((prev) =>
      prev.includes(label)

        ? prev.filter(
            (item) =>
              item !== label
          )

        : [
            ...prev,
            label,
          ]
    );

  }


  function isActive(
    href?: string
  ) {

    if (!href) {
      return false;
    }

    return (
      pathname === href ||
      pathname.startsWith(
        href + "/"
      )
    );

  }


  return (

    <Sheet
      open={open}
      onOpenChange={setOpen}
    >

      <SheetTrigger
        className="
          inline-flex
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-sm
          font-medium
          transition-colors
          hover:bg-slate-100
          hover:text-slate-900
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-slate-400
          focus-visible:ring-offset-2
          disabled:pointer-events-none
          disabled:opacity-50
          h-10
          w-10
          lg:hidden
        "
      >

        <Menu
          className="h-6 w-6"
        />

      </SheetTrigger>


      <SheetContent
        side="left"
        className="w-80 p-0"
      >

        <div
          className="
            flex
            h-full
            flex-col
            bg-gradient-to-b
            from-slate-50
            via-white
            to-indigo-50/40
          "
        >

          {/* Header */}

          <div
            className="
              border-b
              bg-white/90
              backdrop-blur
            "
          >

            <div className="p-6">

              <Logo />

            </div>

          </div>


          {/* Navigation */}

          <nav
            className="
              flex-1
              overflow-y-auto
              p-5
            "
          >

            <div
              className="space-y-2"
            >

              {filteredNavigation.map(
                (item) => {

                  const Icon =
                    item.icon;


                  /*
                   * Items with children.
                   */
                  if (item.children) {

                    const menuOpen =
                      openMenus.includes(
                        item.label
                      );

                    const parentActive =
                      isActive(
                        item.href
                      );


                    return (

                      <div
                        key={item.label}
                        className="space-y-2"
                      >

                        {/*
                         * Parent navigation.
                         *
                         * If the parent has an
                         * href (e.g. Inventory),
                         * clicking its label
                         * navigates to the overview.
                         *
                         * The chevron separately
                         * controls expansion.
                         */}

                        <div
                          className="
                            flex
                            items-center
                            gap-1
                          "
                        >

                          {item.href ? (

                            <Link
                              href={item.href}
                              onClick={() =>
                                setOpen(false)
                              }
                              className={`
                                flex
                                flex-1
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                font-semibold
                                transition

                                ${
                                  parentActive
                                    ? `
                                      bg-gradient-to-r
                                      from-indigo-600
                                      via-violet-600
                                      to-purple-600
                                      text-white
                                      shadow-xl
                                    `
                                    : `
                                      text-slate-700
                                      hover:bg-white
                                      hover:shadow-sm
                                    `
                                }
                              `}
                            >

                              <Icon
                                size={20}
                              />

                              <span>
                                {item.label}
                              </span>

                            </Link>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                toggleMenu(
                                  item.label
                                )
                              }
                              className="
                                flex
                                flex-1
                                items-center
                                gap-3
                                rounded-xl
                                px-3
                                py-3
                                font-semibold
                                text-slate-700
                                transition
                                hover:bg-white
                                hover:shadow-sm
                              "
                            >

                              <Icon
                                size={20}
                              />

                              <span>
                                {item.label}
                              </span>

                            </button>

                          )}


                          {/*
                           * Expansion button.
                           */}

                          <button
                            type="button"
                            aria-label={
                              menuOpen
                                ? `Collapse ${item.label}`
                                : `Expand ${item.label}`
                            }
                            onClick={() =>
                              toggleMenu(
                                item.label
                              )
                            }
                            className="
                              rounded-xl
                              p-3
                              text-slate-600
                              transition
                              hover:bg-white
                              hover:text-indigo-700
                            "
                          >

                            <ChevronDown
                              size={18}
                              className={`
                                transition-transform
                                duration-300
                                ${
                                  menuOpen
                                    ? "rotate-180"
                                    : ""
                                }
                              `}
                            />

                          </button>

                        </div>


                        {/*
                         * Children.
                         */}

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
                                menuOpen
                                  ? `
                                    max-h-[2000px]
                                    space-y-2
                                    pt-2
                                  `
                                  : `
                                    max-h-0
                                    space-y-0
                                  `
                              }
                          `}
                        >

                          {item.children.map(
                            (child) => {

                              if (
                                !child.href
                              ) {
                                return null;
                              }


                              const ChildIcon =
                                child.icon;

                              const active =
                                isActive(
                                  child.href
                                );


                              return (

                                <Link
                                  key={
                                    child.label
                                  }
                                  href={
                                    child.href
                                  }
                                  onClick={() =>
                                    setOpen(
                                      false
                                    )
                                  }
                                  className={`
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
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

                                  <ChildIcon
                                    size={17}
                                  />

                                  <span>
                                    {child.label}
                                  </span>

                                </Link>

                              );

                            }
                          )}

                        </div>

                      </div>

                    );

                  }


                  /*
                   * Normal navigation item.
                   *
                   * Only render a Link when
                   * href actually exists.
                   */

                  if (!item.href) {
                    return null;
                  }


                  const active =
                    isActive(
                      item.href
                    );


                  return (

                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() =>
                        setOpen(false)
                      }
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

                      <Icon
                        size={20}
                      />

                      <span>
                        {item.label}
                      </span>

                    </Link>

                  );

                }
              )}

            </div>

          </nav>

        </div>

      </SheetContent>

    </Sheet>

  );
}