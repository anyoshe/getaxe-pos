"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";

import { navigation } from "@/config/navigation";

import { Logo } from "./logo";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

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

    <Sheet
      open={open}
      onOpenChange={setOpen}
    >

      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          />
        }
      >

        <Menu className="h-6 w-6" />

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

          <div className="border-b bg-white/90 backdrop-blur">

            <div className="p-6">
              <Logo />
            </div>


          </div>


          {/* Navigation */}

          <nav className="flex-1 overflow-y-auto p-5">

            <div className="space-y-2">

              {navigation.map((item) => {

                const Icon = item.icon;

            if (item.children) {

                  return (

                    <div
                      key={item.label}
                      className="space-y-2"
                    >

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
                          hover:bg-white
                          hover:shadow-sm
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
                          className={
                            `
                            transition-transform duration-300
                            ${
                              openMenus.includes(item.label)
                                ? "rotate-180"
                                : ""
                            }
                            `
                          }
                        />

                      </button>



                      <div
                        className={
                          `
                          ml-5
                          overflow-hidden
                          border-l-2
                          border-slate-200
                          pl-4
                          transition-all
                          duration-300
                          ${
                            openMenus.includes(item.label)
                              ? "max-h-96 space-y-2 pt-2"
                              : "max-h-0 space-y-0"
                          }
                          `
                        }
                      >

                        {item.children.map((child) => {

                          const ChildIcon = child.icon;


                          const active =
                            pathname === child.href ||
                            pathname.startsWith(
                              child.href! + "/"
                            );


                          return (

                            <Link
                              key={child.label}
                              href={child.href!}
                              onClick={() => setOpen(false)}
                              className={
                                `
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
                                `
                              }
                            >

                              <ChildIcon size={17} />

                              <span>
                                {child.label}
                              </span>


                            </Link>

                          );

                        })}


                      </div>


                    </div>

                  );

                }



                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    item.href! + "/"
                  );


                return (

                  <Link
                    key={item.label}
                    href={item.href!}
                    onClick={() => setOpen(false)}
                    className={
                      `
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
                      `
                    }
                  >

                    <Icon size={20} />

                    <span>
                      {item.label}
                    </span>


                  </Link>

                );

              })}


            </div>


          </nav>


        </div>


      </SheetContent>


    </Sheet>

  );

}