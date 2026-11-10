import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";

import type { InventoryGuide } from "../lib/inventory-next-step";
import { cn } from "@/lib/utils";

type Props = {
  guide: InventoryGuide;
  /** When true, hide the card entirely if phase is ready */
  hideWhenReady?: boolean;
  className?: string;
};

/**
 * Soft next-step banner for Inventory overview and empty products.
 * Does not replace Go live — points back to it when useful.
 */
export function InventoryNextStepCard({
  guide,
  hideWhenReady = true,
  className,
}: Props) {
  if (hideWhenReady && guide.phase === "ready") return null;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-card to-card shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
              Next step
            </span>
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {guide.steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-1.5">
                  {i > 0 ? (
                    <span className="text-muted-foreground/50">→</span>
                  ) : null}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      s.status === "done" &&
                        "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                      s.status === "current" &&
                        "bg-indigo-500/15 font-medium text-indigo-700 dark:text-indigo-200",
                      s.status === "todo" && "bg-muted/60",
                    )}
                  >
                    {s.status === "done" ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Circle className="h-2.5 w-2.5" />
                    )}
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {guide.title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {guide.detail}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={guide.primary.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {guide.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {guide.secondary.map((s) => (
              <Link
                key={s.href + s.label}
                href={s.href}
                className="inline-flex items-center rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground hover:border-indigo-500/40"
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
