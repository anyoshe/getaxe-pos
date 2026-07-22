"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "@/config/navigation";

import { Logo } from "./logo";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100 lg:flex lg:flex-col">

      <div className="sticky top-0 border-b bg-white/80 p-6 backdrop-blur">
        <Logo />
      </div>

      <nav className="flex-1 space-y-8 p-5">

        {navigation.map((section) => (
          <div key={section.title}>

            <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              {section.title}
            </h3>

            <div className="space-y-1">

              {section.items.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-3
                      text-sm font-medium transition-all duration-200
                      ${
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                      }
                    `}
                  >
                    <Icon size={19} />

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