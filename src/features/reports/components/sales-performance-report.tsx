"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadXlsx } from "@/lib/spreadsheet";
import { getSalesPerformanceReportAction } from "../actions/operational-reports";

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type ReportData = Awaited<
  ReturnType<typeof getSalesPerformanceReportAction>
> extends { success: true; data: infer D }
  ? D
  : never;

export function SalesPerformanceReport() {
  const [pending, start] = useTransition();
  const [fromDate, setFromDate] = useState(todayNairobi());
  const [toDate, setToDate] = useState(todayNairobi());
  const [data, setData] = useState<ReportData | null>(null);

  function run() {
    start(async () => {
      const r = await getSalesPerformanceReportAction({ fromDate, toDate });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setData(r.data);
    });
  }

  function exportExcel() {
    if (!data) return;
    const rows = data.byProduct.map((r) => ({
      Product: r.productName,
      SKU: r.sku ?? "",
      Quantity: r.quantity,
      Revenue: Number(r.revenue.toFixed(2)),
      Tax: Number(r.tax.toFixed(2)),
      Discount: Number(r.discount.toFixed(2)),
      Cost: Number(r.cost.toFixed(2)),
      Margin: Number(r.margin.toFixed(2)),
      "Margin %": Number(r.marginPct.toFixed(1)),
    }));
    rows.push({
      Product: "TOTAL",
      SKU: "",
      Quantity: data.totals.quantity,
      Revenue: Number(data.totals.revenue.toFixed(2)),
      Tax: Number(data.totals.tax.toFixed(2)),
      Discount: Number(data.totals.discount.toFixed(2)),
      Cost: Number(data.totals.cost.toFixed(2)),
      Margin: Number(data.totals.margin.toFixed(2)),
      "Margin %": Number(data.totals.marginPct.toFixed(1)),
    });
    downloadXlsx(
      `sales-performance-${data.fromDate}-to-${data.toDate}.xlsx`,
      "Sales",
      rows,
    );
  }

  function exportPdf() {
    if (!data) return;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) {
      toast.error("Allow pop-ups to export PDF.");
      return;
    }
    const body = document.getElementById("sales-report-print")?.innerHTML ?? "";
    w.document.write(`<!DOCTYPE html><html><head><title>Sales report</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:16px;color:#000;background:#fff}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ccc;padding:6px;text-align:left}
        th{background:#f3f4f6}
        .num{text-align:right}
        h1{font-size:18px;margin:0 0 8px}
      </style></head><body>${body}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales performance</h1>
        <p className="text-sm text-muted-foreground">
          Quantity, revenue, tax, cost and margin by product for any period.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="space-y-1">
          <Label>From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <Button type="button" disabled={pending} onClick={run}>
          {pending ? "Loading…" : "Run report"}
        </Button>
        {data ? (
          <>
            <Button type="button" variant="outline" onClick={exportExcel}>
              Download Excel
            </Button>
            <Button type="button" variant="outline" onClick={exportPdf}>
              Download PDF
            </Button>
          </>
        ) : null}
      </div>

      {data ? (
        <div id="sales-report-print" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              Sales {data.fromDate} → {data.toDate}
            </h2>
            <p className="text-sm text-muted-foreground">
              {data.invoiceCount} invoices · Invoice total KES{" "}
              {money(data.invoiceTotal)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Qty sold" value={data.totals.quantity.toLocaleString()} />
            <Kpi label="Revenue" value={`KES ${money(data.totals.revenue)}`} />
            <Kpi label="Tax" value={`KES ${money(data.totals.tax)}`} />
            <Kpi
              label="Gross margin"
              value={`KES ${money(data.totals.margin)} (${data.totals.marginPct.toFixed(1)}%)`}
            />
          </div>

          {data.paymentsByMethod.length > 0 ? (
            <div className="rounded-xl border p-3 text-sm">
              <p className="mb-2 font-semibold">Payments received</p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {data.paymentsByMethod.map((p) => (
                  <li key={p.method} className="flex justify-between gap-4">
                    <span>{p.method}</span>
                    <span className="tabular-nums">
                      {money(p.total)} ({p.count})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Revenue</th>
                  <th className="p-3 text-right">Tax</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-right">Margin</th>
                  <th className="p-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody>
                {data.byProduct.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No sales in this period.
                    </td>
                  </tr>
                ) : (
                  data.byProduct.map((r) => (
                    <tr key={r.productId} className="border-t">
                      <td className="p-3 font-medium">{r.productName}</td>
                      <td className="p-3 font-mono text-xs">{r.sku ?? "—"}</td>
                      <td className="p-3 text-right tabular-nums">
                        {r.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {money(r.revenue)}
                      </td>
                      <td className="p-3 text-right tabular-nums">{money(r.tax)}</td>
                      <td className="p-3 text-right tabular-nums">{money(r.cost)}</td>
                      <td className="p-3 text-right tabular-nums font-medium">
                        {money(r.margin)}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {r.marginPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {data.byProduct.length > 0 ? (
                <tfoot>
                  <tr className="border-t bg-secondary/30 font-semibold">
                    <td className="p-3" colSpan={2}>
                      Total
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {data.totals.quantity.toLocaleString()}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(data.totals.revenue)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(data.totals.tax)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(data.totals.cost)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(data.totals.margin)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {data.totals.marginPct.toFixed(1)}%
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a period and click <strong>Run report</strong>.
        </p>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
