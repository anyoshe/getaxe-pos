"use client";

import { CheckCircle2, XCircle } from "lucide-react";

import type { StatusBadgeProps } from "./types";

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        transition-all

        ${
          active
            ? `
              border-emerald-200
              bg-emerald-50
              text-emerald-700
            `
            : `
              border-rose-200
              bg-rose-50
              text-rose-700
            `
        }
      `}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}

      {active ? activeLabel : inactiveLabel}
    </span>
  );
}