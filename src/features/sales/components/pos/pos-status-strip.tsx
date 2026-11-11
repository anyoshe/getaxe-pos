"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export type PosStatusStripProps = {
  online: boolean;
  pendingCount: number;
  onFlushOutbox?: () => void;
  /** e.g. "Idle" | "Sending STK…" | "Waiting payment" | error text */
  mpesaLabel?: string | null;
  mpesaTone?: "idle" | "busy" | "ok" | "error";
  /** OFF | SIMULATED path | LIVE pending */
  etimsLabel?: string | null;
  className?: string;
};

/**
 * Always-visible trust strip: connectivity, offline queue, M-Pesa, eTIMS.
 */
export function PosStatusStrip({
  online,
  pendingCount,
  onFlushOutbox,
  mpesaLabel,
  mpesaTone = "idle",
  etimsLabel,
  className,
}: PosStatusStripProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border/60 bg-muted/40 px-2 py-1.5 text-[10px] font-medium sm:gap-2 sm:px-3 sm:text-[11px]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
          online
            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
            : "bg-amber-500/20 text-amber-900 dark:text-amber-200",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            online ? "bg-emerald-500" : "bg-amber-500 animate-pulse",
          )}
        />
        {online ? "Online" : "Offline"}
      </span>

      {pendingCount > 0 ? (
        <button
          type="button"
          onClick={onFlushOutbox}
          className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-rose-800 hover:bg-rose-500/25 dark:text-rose-200"
          title="Retry syncing queued sales"
        >
          {pendingCount} sale{pendingCount === 1 ? "" : "s"} queued
          {online ? " · tap to sync" : ""}
        </button>
      ) : (
        <span className="inline-flex rounded-full bg-background/80 px-2 py-0.5 text-muted-foreground ring-1 ring-border/60">
          Queue clear
        </span>
      )}

      {mpesaLabel ? (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5",
            mpesaTone === "busy" &&
              "bg-sky-500/15 text-sky-900 dark:text-sky-200",
            mpesaTone === "ok" &&
              "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
            mpesaTone === "error" &&
              "bg-rose-500/15 text-rose-800 dark:text-rose-200",
            mpesaTone === "idle" &&
              "bg-background/80 text-muted-foreground ring-1 ring-border/60",
          )}
        >
          M-Pesa · {mpesaLabel}
        </span>
      ) : null}

      {etimsLabel ? (
        <Link
          href="/settings/etims"
          className="ml-auto inline-flex rounded-full bg-background/80 px-2 py-0.5 text-muted-foreground ring-1 ring-border/60 hover:text-foreground"
          title="eTIMS settings"
        >
          eTIMS · {etimsLabel}
        </Link>
      ) : (
        <span className="ml-auto inline-flex rounded-full bg-background/80 px-2 py-0.5 text-muted-foreground ring-1 ring-border/60">
          eTIMS · off
        </span>
      )}
    </div>
  );
}
