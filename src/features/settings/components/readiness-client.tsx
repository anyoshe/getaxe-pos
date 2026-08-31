"use client";

import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

import type { SetupCheck } from "../services/setup-readiness.service";

export function ReadinessClient({
  score,
  checks,
  requiredDone,
  requiredTotal,
}: {
  score: number;
  checks: SetupCheck[];
  requiredDone: number;
  requiredTotal: number;
}) {
  const required = checks.filter((c) => !c.optional);
  const optional = checks.filter((c) => c.optional);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Settings
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Go-live readiness
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Work through required steps so POS, stock, purchasing, and finance
            stay in sync. Optional items appear when related capabilities are on.
          </p>
        </div>
        <div className="rounded-2xl border bg-card px-6 py-4 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-primary">
            {score}%
          </div>
          <div className="text-xs text-muted-foreground">
            {requiredDone}/{requiredTotal} required
          </div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${score}%` }}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Required
        </h2>
        <ul className="space-y-2">
          {required.map((c) => (
            <CheckRow key={c.id} check={c} />
          ))}
        </ul>
      </section>

      {optional.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Optional / capability-guided
          </h2>
          <ul className="space-y-2">
            {optional.map((c) => (
              <CheckRow key={c.id} check={c} />
            ))}
          </ul>
        </section>
      ) : null}

      {score >= 100 ? (
        <div className="rounded-xl border border-chart-4/30 bg-chart-4/10 p-4 text-sm">
          <p className="font-medium">Core setup looks complete.</p>
          <p className="mt-1 text-muted-foreground">
            Run a test POS sale and open Reports to confirm live numbers. Use
            Cycle counts after your first physical stock take.
          </p>
          <Link
            href="/sales/pos"
            className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Open POS <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function CheckRow({ check }: { check: SetupCheck }) {
  return (
    <li>
      <Link
        href={check.href}
        className="flex items-start gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/40 hover:bg-muted/40"
      >
        {check.done ? (
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-chart-4" />
        ) : (
          <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-medium ${check.done ? "text-muted-foreground line-through" : "text-foreground"}`}
            >
              {check.label}
            </span>
            {check.optional ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Optional
              </span>
            ) : null}
          </div>
          {check.description ? (
            <p className="text-xs text-muted-foreground">{check.description}</p>
          ) : null}
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
      </Link>
    </li>
  );
}
