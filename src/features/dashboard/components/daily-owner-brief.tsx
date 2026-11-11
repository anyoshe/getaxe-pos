import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { DailyOwnerBrief } from "../services/owner-brief.service";

function toneClass(tone: DailyOwnerBrief["priorities"][0]["tone"]) {
  switch (tone) {
    case "critical":
      return "border-rose-500/35 bg-rose-500/10";
    case "warning":
      return "border-amber-500/35 bg-amber-500/10";
    case "positive":
      return "border-emerald-500/35 bg-emerald-500/10";
    default:
      return "border-primary/25 bg-primary/5";
  }
}

function money(n: number) {
  return Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function DailyOwnerBriefCard({ brief }: { brief: DailyOwnerBrief }) {
  return (
    <section
      aria-label="Daily owner brief"
      className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {brief.headline}
            </h2>
            <p className="text-xs text-muted-foreground">
              Live from your GetAxe books · use advisor for WhatsApp brief copy
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] tabular-nums text-muted-foreground">
          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1">
            Sales today KES {money(brief.snapshot.todaySales)}
          </span>
          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1">
            Cash KES {money(brief.snapshot.cashTotal)}
          </span>
          <span className="rounded-full border border-border bg-background/80 px-2.5 py-1">
            Low stock {brief.snapshot.lowStock}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        <p className="text-sm leading-relaxed text-foreground/90">
          {brief.narrative}
        </p>

        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {brief.priorities.map((p) => (
            <li key={`${p.rank}-${p.title}`}>
              <Link
                href={p.href}
                className={`group flex h-full min-h-[96px] flex-col justify-between rounded-xl border p-3 transition hover:border-primary/40 ${toneClass(p.tone)}`}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Priority {p.rank}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                    {p.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.detail}
                  </p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Act
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-xs">
          <Link
            href="/dashboard/weekly-brief"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Open weekly owner brief →
          </Link>
        </p>
      </div>
    </section>
  );
}
