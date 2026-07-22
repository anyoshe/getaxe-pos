"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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

    return (
        <Sheet>
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
                className="w-72 p-0"
            >
                <div className="flex h-full flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">

                    {/* Logo */}

                    <div className="border-b border-slate-200 p-6">
                        <Logo />
                    </div>

                    {/* Navigation */}

                    <nav className="flex-1 overflow-y-auto p-5">

                        <div className="space-y-8">

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
                                                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${active
                                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                                                            : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                                        }`}
                                                >
                                                    <Icon size={19} />

                                                    <span>{item.label}</span>
                                                </Link>
                                            );

                                        })}

                                    </div>

                                </div>
                            ))}

                        </div>

                    </nav>

                </div>
            </SheetContent>
        </Sheet>
    );
}