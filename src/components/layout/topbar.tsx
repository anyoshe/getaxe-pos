"use client";

import {
  Bell,
  Search,
  Sun,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./mobile-sidebar";

import type {
  CurrentUser,
} from "@/lib/auth/current-user";


import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/features/auth/actions/logout";

interface TopbarProps {
  user: CurrentUser;
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">

      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">

        {/* Left */}

        <div className="flex items-center gap-3">

          <MobileSidebar />

          <div className="flex items-center gap-3">

                  <div
                    className="
                      relative
                      h-9
                      w-9
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      shadow-sm
                    "
                  >

                    {user.business.logo ? (

                      <Image
                        src={user.business.logo}
                        alt={user.business.name}
                        fill
                        className="object-contain p-1"
                      />

                    ) : (

                      <div
                        className="
                          flex
                          h-full
                          w-full
                          items-center
                          justify-center
                          bg-gradient-to-r
                          from-indigo-600
                          via-violet-600
                          to-purple-600
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        {user.business.name.charAt(0)}
                      </div>

                    )}

                  </div>


                  <div className="flex flex-col">

                    <h1
                      className="
                        text-lg
                        font-extrabold
                        tracking-tight
                        bg-gradient-to-r
                        from-indigo-600
                        via-violet-600
                        to-purple-600
                        bg-clip-text
                        text-transparent
                      "
                    >
                      {user.business.name}
                    </h1>


                    <p className="text-xs font-medium text-slate-500">
                      Dashboard
                    </p>


                  </div>

                </div>
        </div>

        {/* Search */}

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

          <DropdownMenu>

            <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-slate-100">

              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarFallback className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                  {user.initials}
                </AvatarFallback>
              </Avatar>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold">
                  {user.name}
                </p>

                <p className="text-xs text-slate-500">
                  {user.role.name}
                </p>
              </div>

            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <p className="font-semibold">
                {user.business.name}
              </p>
              <div className="px-2 py-2">

                <p className="font-medium">
                  {user.name}
                </p>

                <p className="text-xs text-muted-foreground">
                  {user.role.name}
                </p>

              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem>

                <User className="mr-2 h-4 w-4" />

                Profile

              </DropdownMenuItem>

              <DropdownMenuItem>

                <Settings className="mr-2 h-4 w-4" />

                Settings

              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <form action={logout}>

                <button
                  type="submit"
                  className="flex w-full items-center rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                >

                  <LogOut className="mr-2 h-4 w-4" />

                  Logout

                </button>

              </form>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>

    </header>
  );
}