"use client";

import {
  Search,
  Plus,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

interface RoleToolbarProps {

  search: string;

  status: string;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: string,
  ) => void;

  onCreate: () => void;

}

export function RoleToolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onCreate,
}: RoleToolbarProps) {

  return (

    <div
      className="
        rounded-xl
        border
        bg-gradient-to-r
        from-indigo-50
        via-white
        to-lime-50
        p-4
        shadow-sm
        dark:from-indigo-950/30
        dark:via-background
        dark:to-lime-950/20
      "
    >

      <div className="flex flex-col gap-4">

        <div>

          <h2
            className="
              text-2xl
              font-bold
              text-indigo-700
              dark:text-indigo-300
            "
          >
            Role Management
          </h2>

          <p className="text-sm text-muted-foreground">
            Create and manage system roles.
          </p>

        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-[1fr_220px_auto]
            md:items-center
          "
        >

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                size-4
                -translate-y-1/2
                text-indigo-500
              "
            />

            <Input
              value={search}
              onChange={(e) =>
                onSearchChange(
                  e.target.value,
                )
              }
              placeholder="Search roles..."
              className="
                pl-9
                focus-visible:ring-indigo-500
              "
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value,
              )
            }
            className="
              h-10
              rounded-md
              border
              bg-background
              px-3
              text-sm
              shadow-sm
              focus:border-indigo-500
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          >

            <option value="">
              All Status
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>

          </select>

          <Button
            onClick={onCreate}
            className="
              md:ml-auto
              gap-2
              bg-indigo-600
              text-white
              hover:bg-indigo-700
            "
          >

            <Plus className="size-4" />

            Add Role

          </Button>

        </div>

      </div>

    </div>

  );

}