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
    <div className="space-y-8">

      {/* Hero */}

      <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-xl">

        <div className="flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">

          <div className="space-y-3">

            <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur">
              GetAxe ERP
            </span>

            <h1 className="text-4xl font-bold tracking-tight">
              {title}
            </h1>

            {description && (
              <p className="max-w-2xl text-base text-indigo-100">
                {description}
              </p>
            )}

          </div>

          {onCreate && (
            <Button
              onClick={onCreate}
              size="lg"
              className="
                rounded-2xl
                bg-white
                px-6
                text-indigo-700
                shadow-xl
                hover:bg-indigo-50
              "
            >
              <Plus className="mr-2 h-5 w-5" />
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