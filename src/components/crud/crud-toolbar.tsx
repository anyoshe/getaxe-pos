"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CrudToolbarProps } from "./types";

export function CrudToolbar({
  search = "",
  onSearchChange,
  filters,
  actions,
  createButton,
}: CrudToolbarProps) {
  return (
    <div className="rounded-3xl border border-border bg-background/90 p-5 shadow-sm backdrop-blur">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* Search */}

        {onSearchChange && (
          <div className="relative w-full lg:max-w-md">

            <Search
              className="
                absolute
                left-4
                top-1/2
                h-5
                w-5
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              value={search}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              placeholder="Search..."
              className="
                h-12
                rounded-2xl
                border-border
                bg-muted/50
                pl-12
                shadow-none
                transition-all
                focus:border-primary
                focus:bg-card
                focus:ring-2
                focus:ring-primary/30
              "
            />

          </div>
        )}

        {/* Filters */}

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">

            <Button
              variant="outline"
              className="
                rounded-2xl
                border-border
                bg-card
                hover:bg-primary/10
              "
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>

            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant="outline"
                className="
                  rounded-2xl
                  border-border
                  bg-muted/50
                  hover:border-primary/40
                  hover:bg-primary/10
                "
              >
                {filter.label}
              </Button>
            ))}

          </div>
        )}

        {/* Actions */}

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">

          {actions}

          {createButton}

        </div>

      </div>

    </div>
  );
}