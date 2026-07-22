"use client";

import {
  Bell,
  Search,
  Sun,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./mobile-sidebar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">

      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">

        {/* Left */}

        <div className="flex items-center gap-3">

        <MobileSidebar />

          <h1 className="text-xl font-bold text-slate-800">
            Dashboard
          </h1>

        </div>

        {/* Center */}

        <div className="hidden w-full max-w-md md:block">

          <div className="relative">

            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <Input
              placeholder="Search anything..."
              className="rounded-xl border-slate-200 pl-10"
            />

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-2">

          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl"
          >
            <Sun className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="rounded-xl"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Avatar className="h-10 w-10">

            <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">

              EA

            </AvatarFallback>

          </Avatar>

        </div>

      </div>

    </header>
  );
}