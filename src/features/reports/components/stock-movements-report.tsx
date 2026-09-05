"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadXlsx } from "@/lib/spreadsheet";
import { getStockMovementsReportAction } from "../actions/operational-reports";

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function qty(n: number) {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

type ReportData = Awaited<
  ReturnType<typeof getStockMovementsReportAction>
> extends { success: true; data: infer D }
  ? D
  : never;

export function StockMovementsReport() {
  const [pending, start] = useTransition();
  const [fromDate, setFromDate] = useState(todayNairobi());
  const [toDate, setToDate] = useState(todayNairobi());
  const [data, setData] = useState<ReportData | null>(null);

  function run() {
    start(async () => {
      const r = await getStockMovementsReportAction({ fromDate, toDate });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setData(r.data);
    });
  }

  function exportExcel() {
    if (!data) return;
    const flat: Array<Record<string, string | number>> = [];
    for (const p of data.byProduct) {
      flat.push({
        Product: p.productName,
        SKU: p.sku ?? "",
        Date: fromDate,
        Type: "OPENING",
        Warehouse: "",
        Quantity: 0,
        "Balance before": p.openingStock,
        "Balance after": p.openingStock,
        Reference: `Opening stock as at ${fromDate}`,
      });
      for (const m of p.movements) {
        flat.push({
          Product: p.productName,
          SKU: p.sku ?? "",
          Date: m.date,
          Type: m.movementType,
          Warehouse: m.warehouseName,
          Quantity: m.quantity,
          "Balance before": m.balanceBefore,
          "Balance after": m.balanceAfter,
          Reference: m.reference ?? "",
        });
      }
      flat.push({
        Product: p.productName,
        SKU: p.sku ?? "",
        Date: toDate,
        Type: "CLOSING",
        Warehouse: "",
        Quantity: 0,
        "Balance before": p.closingStock,
        "Balance after": p.closingStock,
        Reference: `Closing stock as at ${toDate}`,
      });
    }
    downloadXlsx(
      `stock-movements-${data.fromDate}-to-${data.toDate}.xlsx`,
      "Movements",
      flat,
    );
  }

  function exportPdf() {
    if (!data) return;
    const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!w) {
      toast.error("Allow pop-ups to export PDF.");
      return;
    }
    const body = document.getElementById("stock-report-print")?.innerHTML ?? "";
    w.document.write(`<!DOCTYPE html><html><head><title>Stock movements</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:16px;color:#000}
        table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}
        th,td{border:1px solid #ccc;padding:5px;text-align:left}
        th{background:#f3f4f6}
        h3{margin:12px 0 4px;font-size:14px}
        .meta{color:#555;font-size:12px;margin-bottom:8px}
      </style></head><body>${body}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock movements</h1>
        <p className="text-sm text-muted-foreground">
          Per product: opening stock at start date, each movement (date, qty),
          and balance after that movement.
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
        <div id="stock-report-print" className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Stock ledger {data.fromDate} → {data.toDate}
            </h2>
            <p className="text-sm text-muted-foreground">
              Opening = stock before first day of the range. Balance after =
              running stock after each movement.
            </p>
          </div>

          {data.byType.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.byType.map((t) => (
                <div
                  key={t.movementType}
                  className="rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <span className="font-medium">{t.movementType}</span>
                  <span className="ml-2 tabular-nums text-muted-foreground">
                    {t.count} · qty {qty(t.totalQty)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {data.byProduct.length === 0 ? (
            <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No stock movements in this period.
            </p>
          ) : (
            data.byProduct.map((p) => (
              <section
                key={p.productId}
                className="overflow-hidden rounded-xl border"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-secondary/40 px-4 py-3">
                  <div>
                    <h3 className="font-semibold">{p.productName}</h3>
                    {p.sku ? (
                      <p className="font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm tabular-nums">
                    <span>
                      <span className="text-muted-foreground">Opening </span>
                      <strong>{qty(p.openingStock)}</strong>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Moved </span>
                      <strong>{qty(p.quantityMoved)}</strong>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Closing </span>
                      <strong>{qty(p.closingStock)}</strong>
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-secondary/20 text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Warehouse</th>
                        <th className="p-3 text-right">Qty moved</th>
                        <th className="p-3 text-right">Balance before</th>
                        <th className="p-3 text-right">Balance after</th>
                        <th className="p-3">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t bg-primary/5">
                        <td className="p-3 text-muted-foreground">{fromDate}</td>
                        <td className="p-3 font-medium">OPENING</td>
                        <td className="p-3">—</td>
                        <td className="p-3 text-right tabular-nums">—</td>
                        <td className="p-3 text-right tabular-nums">—</td>
                        <td className="p-3 text-right font-semibold tabular-nums">
                          {qty(p.openingStock)}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          Stock at start of period
                        </td>
                      </tr>
                      {p.movements.map((m) => (
                        <tr key={m.id} className="border-t">
                          <td className="p-3 whitespace-nowrap text-muted-foreground">
                            {m.date}
                          </td>
                          <td className="p-3">{m.movementType}</td>
                          <td className="p-3">{m.warehouseName}</td>
                          <td className="p-3 text-right tabular-nums font-medium">
                            {qty(m.quantity)}
                          </td>
                          <td className="p-3 text-right tabular-nums text-muted-foreground">
                            {qty(m.balanceBefore)}
                          </td>
                          <td className="p-3 text-right tabular-nums font-semibold">
                            {qty(m.balanceAfter)}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {m.reference ?? "—"}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-secondary/30 font-semibold">
                        <td className="p-3">{toDate}</td>
                        <td className="p-3">CLOSING</td>
                        <td className="p-3">—</td>
                        <td className="p-3 text-right">—</td>
                        <td className="p-3 text-right">—</td>
                        <td className="p-3 text-right tabular-nums">
                          {qty(p.closingStock)}
                        </td>
                        <td className="p-3 text-muted-foreground font-normal">
                          Stock at end of period
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a period and click <strong>Run report</strong>.
        </p>
      )}
    </div>
  );
}
