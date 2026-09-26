import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getProfitDetailAction } from "@/features/dashboard/actions/profit-detail";
import { formatDateTimeNairobi } from "@/lib/timezone";

export const dynamic = "force-dynamic";

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function ProfitPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ period?: string; view?: string }>
    | { period?: string; view?: string };
}) {
  const sp = await Promise.resolve(searchParams ?? {});
  const period = sp.period === "today" ? "today" : "month";
  const view = sp.view === "loss" ? "loss" : sp.view === "top" ? "top" : "all";

  const data = await getProfitDetailAction(period);

  const rows =
    view === "loss"
      ? data.losses
      : view === "top"
        ? data.profitable.slice(0, 5)
        : data.profitable;

  const lossLines = data.lossLines ?? [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Gross profit</h1>
        <p className="text-sm text-muted-foreground">
          Completed sales revenue minus catalogue cost × quantity sold. Loss view
          flags every invoice line sold at cost or below — even if the same
          product also sold at a profit on other invoices.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["month", "This month"],
            ["today", "Today"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/dashboard/profit?period=${id}&view=${view}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              period === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
        {(
          [
            ["all", "All profitable"],
            ["top", "Top 5"],
            ["loss", "At cost / loss"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/dashboard/profit?period=${period}&view=${id}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              view === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Gross profit</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            KES {money(data.grossProfit)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            KES {money(data.revenue)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Margin %</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {data.marginPct.toFixed(1)}%
          </p>
        </div>
      </div>

      {view === "loss" && (
        <div className="overflow-x-auto rounded-xl border border-rose-500/30">
          <div className="border-b bg-rose-500/10 px-3 py-2 text-sm font-medium">
            Invoice lines sold at cost or below ({lossLines.length})
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">When</th>
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Unit sell</th>
                <th className="p-3">Unit cost</th>
                <th className="p-3">Line total</th>
                <th className="p-3">Margin</th>
              </tr>
            </thead>
            <tbody>
              {lossLines.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No invoice lines at or below book cost in this period.
                  </td>
                </tr>
              ) : (
                lossLines.map((l) => (
                  <tr key={l.saleItemId} className="border-t">
                    <td className="p-3">
                      <Link
                        href={`/sales/invoices/${l.saleId}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {l.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {formatDateTimeNairobi(l.soldAt)}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{l.name}</div>
                      {l.sku ? (
                        <div className="font-mono text-xs text-muted-foreground">
                          {l.sku}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-3 tabular-nums">{l.quantity}</td>
                    <td className="p-3 tabular-nums">{money(l.unitPrice)}</td>
                    <td className="p-3 tabular-nums">{money(l.unitCost)}</td>
                    <td className="p-3 tabular-nums">{money(l.revenue)}</td>
                    <td className="p-3 tabular-nums font-medium text-rose-600 dark:text-rose-400">
                      {money(l.margin)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <div className="border-b bg-muted/30 px-3 py-2 text-sm font-medium">
          {view === "loss"
            ? "Products with at-cost / loss lines (rolled up)"
            : "By product"}
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Revenue</th>
              <th className="p-3">Cost</th>
              <th className="p-3">Profit</th>
              <th className="p-3">Margin %</th>
              {view === "loss" ? <th className="p-3">Invoices</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={view === "loss" ? 7 : 6}
                  className="p-6 text-center text-muted-foreground"
                >
                  No matching product lines for this period.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.productId} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    {r.sku ? (
                      <div className="font-mono text-xs text-muted-foreground">
                        {r.sku}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 tabular-nums">{r.quantity}</td>
                  <td className="p-3 tabular-nums">{money(r.revenue)}</td>
                  <td className="p-3 tabular-nums">{money(r.cost)}</td>
                  <td
                    className={`p-3 tabular-nums font-medium ${
                      r.margin <= 0.009
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {money(r.margin)}
                  </td>
                  <td className="p-3 tabular-nums">
                    {r.marginPct.toFixed(1)}%
                  </td>
                  {view === "loss" ? (
                    <td className="p-3 font-mono text-xs text-muted-foreground">
                      {r.atCostInvoices?.join(", ") ?? "—"}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
