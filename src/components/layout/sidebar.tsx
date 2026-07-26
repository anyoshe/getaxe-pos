"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { navigation } from "@/config/navigation";

import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();

const [openMenus, setOpenMenus] = useState<string[]>([]);

useEffect(() => {
  navigation.forEach((section) => {
    section.items.forEach((item) => {
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

      <div className="sticky top-0 border-b bg-white/90 backdrop-blur">

        <div className="p-6">
          <Logo />
        </div>

        <div className="px-5 pb-5">

          <div
            className="
              rounded-2xl
              bg-gradient-to-r
              from-indigo-600
              via-violet-600
              to-purple-600
              p-4
              text-white
              shadow-xl
            "
          >
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">
              Business
            </p>

            <h3 className="mt-1 text-base font-bold">
              GetAxe Technologies
            </h3>

            <p className="mt-2 text-sm text-indigo-100">
              Administrator
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

              <span className="text-xs">
                Online
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-8 p-5">

        {navigation.map((section) => (

          <div key={section.title}>

            <div className="mb-3 flex items-center gap-2 px-2">

              <span className="h-px flex-1 bg-slate-200" />

              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400">
                {section.title}
              </span>

              <span className="h-px flex-1 bg-slate-200" />

            </div>

            <div className="space-y-2">

              {section.items.map((item) => {

                const Icon = item.icon;

                if (item.children?.length) {

                  return (

                    <div key={item.label} className="space-y-2">

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
    <span>{item.label}</span>
  </div>

  <ChevronDown
    size={18}
    className={`transition-transform duration-200 ${
      openMenus.includes(item.label)
        ? "rotate-180"
        : ""
    }`}
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
      openMenus.includes(item.label)
        ? "max-h-96 space-y-2 pt-2"
        : "max-h-0 space-y-0"
    }
  `}
>

                        {item.children.map((child) => {

                          const ChildIcon = child.icon;

                          const active =
                            pathname === child.href ||
                            pathname.startsWith(child.href! + "/");

                          return (

                            <Link
                              key={child.href}
                              href={child.href!}
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
                              <ChildIcon size={17} />

                              <span>{child.label}</span>

                            </Link>

                          );

                        })}

                      </div>

                    </div>

                  );

                }

                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href! + "/");

                return (

                  <Link
                    key={item.href}
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

                    <span>{item.label}</span>

                  </Link>

                );

              })}

            </div>

          </div>

        ))}

      </nav>

    </aside>
  );
}