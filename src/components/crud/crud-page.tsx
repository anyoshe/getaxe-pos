"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { CrudPageProps } from "./types";

export function CrudPage({
  title,
  description,
  createLabel = "Create",
  onCreate,
  children,
}: CrudPageProps) {
  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Hero */}

      <div className="overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-sm">

        <div className="flex flex-col gap-1 p-2.5 sm:p-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2">

          <div className="space-y-0.5">

            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>

            {description && (
              <p className="max-w-2xl text-xs text-indigo-100 sm:text-sm">
                {description}
              </p>
            )}

          </div>

          {onCreate && (
            <Button
              onClick={onCreate}
              size="sm"
              className="
                rounded-md
                bg-white
                px-2.5
                text-indigo-700
                shadow-sm
                hover:bg-indigo-50
              "
            >
              <Plus className="mr-1 h-4 w-4" />
              {createLabel}
            </Button>
          )}

        </div>

      </div>

      {/* Content */}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {children}
      </div>

    </div>
  );
}