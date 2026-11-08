"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Rocket,
  Sparkles,
} from "lucide-react";

import type { SetupCheck } from "../services/setup-readiness.service";
import {
  buildGoLiveDay,
  resolveGoLiveVertical,
  verticalLabel,
  type GoLiveTask,
} from "../lib/go-live-day";
import { cn } from "@/lib/utils";

type Props = {
  businessName: string | null;
  businessType: string | null;
  score: number;
  checks: SetupCheck[];
  requiredDone: number;
  requiredTotal: number;
};

function taskDone(task: GoLiveTask, checks: SetupCheck[]): boolean | null {
  if (!task.readinessId) return null;
  const c = checks.find((x) => x.id === task.readinessId);
  if (!c) return null;
  return c.done;
}

export function GoLiveDayClient({
  businessName,
  businessType,
  score,
  checks,
  requiredDone,
  requiredTotal,
}: Props) {
  const vertical = resolveGoLiveVertical(businessType);
  const blocks = buildGoLiveDay(vertical);

  const allTasks = blocks.flatMap((b) => b.tasks);
  const tracked = allTasks.filter((t) => t.readinessId);
  const trackedDone = tracked.filter((t) => taskDone(t, checks) === true).length;
  const totalMinutes = allTasks.reduce((s, t) => s + t.minutes, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Rocket className="h-3.5 w-3.5" />
              Go live in 1 day
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {businessName || "Your business"} · {verticalLabel(vertical)}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              One screen for day one: foundations → catalogue & stock → first
              sale. Follow the blocks in order. Green checks come from live
              readiness — not a static PDF.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/80 px-4 py-3 text-center shadow-sm">
            <p className="text-3xl font-bold tabular-nums text-primary">
              {score}%
            </p>
            <p className="text-[11px] text-muted-foreground">
              Readiness · {requiredDone}/{requiredTotal} required
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" />~{totalMinutes} min guided
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            {trackedDone}/{tracked.length || 0} tracked steps done
          </span>
          <Link
            href="/settings/setup-guide"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 hover:border-primary/40"
          >
            Full step-by-step guide
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Day blocks */}
      <div className="space-y-5">
        {blocks.map((block, bi) => (
          <section
            key={block.id}
            className="rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {block.when}
              </p>
              <h2 className="text-base font-semibold tracking-tight">
                {bi + 1}. {block.title}
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {block.tasks.map((task) => {
                const done = taskDone(task, checks);
                return (
                  <li
                    key={task.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 shrink-0">
                        {done === true ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle
                            className={cn(
                              "h-5 w-5",
                              done === false
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground/50",
                            )}
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{task.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {task.detail}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          ~{task.minutes} min
                          {done === true ? " · done in system" : null}
                          {done === false ? " · still open" : null}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={task.href}
                      className={cn(
                        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition",
                        done === true
                          ? "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                          : "bg-primary text-primary-foreground shadow-sm hover:opacity-95",
                      )}
                    >
                      {task.hrefLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Footer CTAs */}
      <footer className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="font-medium">Ready to open the till?</p>
          <p className="text-sm text-muted-foreground">
            When products and stock exist, POS is the proof of go-live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/readiness"
            className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-sm font-medium"
          >
            Full readiness score
          </Link>
          <Link
            href="/sales/pos"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Open POS
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
