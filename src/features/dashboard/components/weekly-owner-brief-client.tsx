"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

import type { WeeklyOwnerBrief } from "../services/weekly-owner-brief.service";

function money(n: number) {
  return `KES ${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

export function WeeklyOwnerBriefClient({ brief }: { brief: WeeklyOwnerBrief }) {
  const s = brief.snapshot;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 to-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Weekly owner brief · in-app
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {brief.periodLabel}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {brief.narrative}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Email / WhatsApp / PDF export can attach to this same brief later —
          numbers are live from sales, stock and open balances.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Revenue", value: money(s.revenue) },
          {
            label: "Gross profit",
            value: `${money(s.grossProfit)} (${s.marginPct.toFixed(1)}%)`,
          },
          { label: "Sales", value: String(s.saleCount) },
          { label: "Cash & bank", value: money(s.cashTotal) },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {c.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{c.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Open AR</p>
          <p className="text-lg font-semibold tabular-nums">{money(s.openAr)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Open AP</p>
          <p className="text-lg font-semibold tabular-nums">{money(s.openAp)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Stock at cost</p>
          <p className="text-lg font-semibold tabular-nums">
            {money(s.stockValue)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Top margin contributors (week)
        </h2>
        {brief.topMargin.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No margin data yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {brief.topMargin.map((r) => (
              <li
                key={r.name}
                className="flex justify-between gap-2 py-2 text-sm"
              >
                <span className="truncate font-medium">{r.name}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {money(r.margin)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
        <h2 className="font-semibold">Dead / slow stock (30 days no sales)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ~{money(s.deadStockValue)} tied up · {s.deadStockCount} line(s)
        </p>
        {brief.deadStock.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">None flagged.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/80">
            {brief.deadStock.map((d) => (
              <li
                key={d.name + (d.sku ?? "")}
                className="flex justify-between gap-2 py-2 text-sm"
              >
                <span>
                  {d.name}
                  {d.sku ? (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {d.sku}
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  qty {d.quantity}
                  {"daysWithoutSale" in d && d.daysWithoutSale
                    ? ` · ${d.daysWithoutSale}d quiet`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/attention?kind=slow"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Open slow-stock attention <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>

      {brief.lossLines.length > 0 ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h2 className="font-semibold">Sold at or below cost</h2>
          <ul className="mt-3 divide-y divide-border/80">
            {brief.lossLines.map((l, i) => (
              <li key={i} className="flex justify-between gap-2 py-2 text-sm">
                <span>
                  {l.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    {l.invoiceNumber}
                  </span>
                </span>
                <span className="tabular-nums text-amber-800 dark:text-amber-300">
                  {money(l.margin)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Do this next</h2>
        <ol className="mt-3 space-y-3">
          {brief.actions.map((a, i) => (
            <li key={i} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  {i + 1}. {a.title}
                </p>
                <p className="text-sm text-muted-foreground">{a.detail}</p>
              </div>
              <Link
                href={a.href}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        Also see{" "}
        <Link href="/dashboard" className="underline">
          daily brief on home
        </Link>{" "}
        ·{" "}
        <Link href="/settings/pricing-policy" className="underline">
          below-cost sale policy
        </Link>
      </p>
    </div>
  );
}
