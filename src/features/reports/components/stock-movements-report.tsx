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
    downloadXlsx(
      `stock-movements-${data.fromDate}-to-${data.toDate}.xlsx`,
      "Movements",
      data.rows.map((r) => ({
        Date: r.date,
        Product: r.productName,
        SKU: r.sku ?? "",
        Warehouse: r.warehouseName,
        Type: r.movementType,
        Quantity: r.quantity,
        Reference: r.reference ?? "",
        Notes: r.notes ?? "",
      })),
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
        table{width:100%;border-collapse:collapse;font-size:11px}
        th,td{border:1px solid #ccc;padding:5px;text-align:left}
        th{background:#f3f4f6}
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
          Receipts, sales issues, transfers, adjustments and returns for a period.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="space-y-1">
          <Label>From</Label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
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
        <div id="stock-report-print" className="space-y-4">
          <h2 className="text-lg font-semibold">
            Movements {data.fromDate} → {data.toDate}
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.byType.map((t) => (
              <div
                key={t.movementType}
                className="rounded-lg border bg-card px-3 py-2 text-sm"
              >
                <span className="font-medium">{t.movementType}</span>
                <span className="ml-2 tabular-nums text-muted-foreground">
                  {t.count} · qty {t.totalQty.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Warehouse</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No movements in this period.
                    </td>
                  </tr>
                ) : (
                  data.rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-3 whitespace-nowrap text-muted-foreground">
                        {r.date}
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{r.productName}</span>
                        {r.sku ? (
                          <span className="block font-mono text-[10px] text-muted-foreground">
                            {r.sku}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3">{r.warehouseName}</td>
                      <td className="p-3">{r.movementType}</td>
                      <td className="p-3 text-right tabular-nums font-medium">
                        {r.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {r.reference ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
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
