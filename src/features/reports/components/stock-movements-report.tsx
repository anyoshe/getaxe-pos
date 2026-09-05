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
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function productTotals(p: {
  openingStock: number;
  closingStock: number;
  movements: Array<{ quantity: number }>;
}) {
  let qtyIn = 0;
  let qtyOut = 0;
  for (const m of p.movements) {
    const q = Number(m.quantity);
    if (!Number.isFinite(q) || q === 0) continue;
    if (q > 0) qtyIn += q;
    else qtyOut += Math.abs(q);
  }
  const net = qtyIn - qtyOut;
  return {
    opening: Number(p.openingStock) || 0,
    qtyIn,
    qtyOut,
    net,
    closing: Number(p.closingStock) || 0,
  };
}


type ReportData = Awaited<
  ReturnType<typeof getStockMovementsReportAction>
> extends { success: true; data: infer D }
  ? D
  : never;

type FlatRow = {
  key: string;
  productName: string;
  sku: string;
  date: string;
  type: string;
  warehouse: string;
  quantity: number | null;
  balanceBefore: number | null;
  balanceAfter: number;
  reference: string;
  isOpen?: boolean;
  isClose?: boolean;
  isProductStart?: boolean;
};

function flatten(data: ReportData, fromDate: string, toDate: string): FlatRow[] {
  const out: FlatRow[] = [];
  for (const p of data.byProduct) {
    out.push({
      key: `${p.productId}-open`,
      productName: p.productName,
      sku: p.sku ?? "",
      date: fromDate,
      type: "OPENING",
      warehouse: "",
      quantity: null,
      balanceBefore: null,
      balanceAfter: p.openingStock,
      reference: "Stock at start of period",
      isOpen: true,
      isProductStart: true,
    });
    for (const m of p.movements) {
      out.push({
        key: m.id,
        productName: p.productName,
        sku: p.sku ?? "",
        date: m.date,
        type: m.movementType,
        warehouse: m.warehouseName,
        quantity: m.quantity,
        balanceBefore: m.balanceBefore,
        balanceAfter: m.balanceAfter,
        reference: m.reference ?? "",
      });
    }
    out.push({
      key: `${p.productId}-close`,
      productName: p.productName,
      sku: p.sku ?? "",
      date: toDate,
      type: "CLOSING",
      warehouse: "",
      quantity: null,
      balanceBefore: null,
      balanceAfter: p.closingStock,
      reference: "Stock at end of period",
      isClose: true,
    });
  }
  return out;
}

export function StockMovementsReport() {
  const [pending, start] = useTransition();
  const [fromDate, setFromDate] = useState(todayNairobi());
  const [toDate, setToDate] = useState(todayNairobi());
  const [data, setData] = useState<ReportData | null>(null);
  const [compact, setCompact] = useState(true);

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
    const rows = flatten(data, fromDate, toDate).map((r) => ({
      Product: r.productName,
      SKU: r.sku,
      Date: r.date,
      Type: r.type,
      Warehouse: r.warehouse,
      "Qty moved": r.quantity ?? "",
      "Balance before": r.balanceBefore ?? "",
      "Balance after": r.balanceAfter,
      Reference: r.reference,
    }));
    downloadXlsx(
      `stock-movements-${data.fromDate}-to-${data.toDate}.xlsx`,
      "Movements",
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
    const body = document.getElementById("stock-report-print")?.innerHTML ?? "";
    w.document.write(`<!DOCTYPE html><html><head><title>Stock movements</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:12px;color:#000;font-size:11px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ccc;padding:3px 5px;text-align:left}
        th{background:#eee}
        .open{background:#eef6ff}
        .close{background:#f3f3f3;font-weight:600}
      </style></head><body>${body}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  const flat = data ? flatten(data, fromDate, toDate) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock movements</h1>
        <p className="text-sm text-muted-foreground">
          Opening stock, each movement (date &amp; qty), and balance after —
          compact ledger for many products.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="space-y-1">
          <Label>From</Label>
          <Input
            type="date"
            className="h-9"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <Input
            type="date"
            className="h-9"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <Button type="button" size="sm" disabled={pending} onClick={run}>
          {pending ? "Loading…" : "Run report"}
        </Button>
        {data ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={exportExcel}>
              Excel
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportPdf}>
              PDF
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setCompact((c) => !c)}
            >
              {compact ? "Card view" : "Compact table"}
            </Button>
          </>
        ) : null}
      </div>

      {data ? (
        <div id="stock-report-print" className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold">
              Stock ledger {data.fromDate} → {data.toDate}
            </h2>
            <p className="text-xs text-muted-foreground">
              {data.byProduct.length} product(s) · {data.rows.length} movement(s)
              · Close = Open + In − Out
            </p>
          </div>

          {data.byType.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 text-xs">
              {data.byType.map((t) => (
                <span
                  key={t.movementType}
                  className="rounded border bg-card px-2 py-0.5"
                >
                  {t.movementType}: {t.count} · {qty(t.totalQty)}
                </span>
              ))}
            </div>
          ) : null}

          {data.byProduct.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No stock movements in this period.
            </p>
          ) : compact ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[780px] text-xs">
                <thead className="sticky top-0 bg-secondary text-left">
                  <tr>
                    <th className="p-2">Product</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Warehouse</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Bal. before</th>
                    <th className="p-2 text-right">Bal. after</th>
                    <th className="p-2">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {flat.map((r) => (
                    <tr
                      key={r.key}
                      className={
                        r.isOpen
                          ? "border-t bg-primary/10 font-medium"
                          : r.isClose
                            ? "border-t bg-muted/60 font-semibold"
                            : "border-t"
                      }
                    >
                      <td className="max-w-[140px] truncate p-1.5">
                        {r.isProductStart || r.isClose ? r.productName : ""}
                      </td>
                      <td className="p-1.5 font-mono text-[10px] text-muted-foreground">
                        {r.isProductStart || r.isClose ? r.sku : ""}
                      </td>
                      <td className="whitespace-nowrap p-1.5 text-muted-foreground">
                        {r.date}
                      </td>
                      <td className="p-1.5">{r.type}</td>
                      <td className="max-w-[100px] truncate p-1.5">
                        {r.warehouse || "—"}
                      </td>
                      <td className="p-1.5 text-right tabular-nums">
                        {r.quantity == null ? "—" : qty(r.quantity)}
                      </td>
                      <td className="p-1.5 text-right tabular-nums text-muted-foreground">
                        {r.balanceBefore == null ? "—" : qty(r.balanceBefore)}
                      </td>
                      <td className="p-1.5 text-right tabular-nums font-semibold">
                        {qty(r.balanceAfter)}
                      </td>
                      <td className="max-w-[120px] truncate p-1.5 text-muted-foreground">
                        {r.reference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            data.byProduct.map((p) => (
              <section
                key={p.productId}
                className="overflow-hidden rounded-lg border text-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b bg-secondary/40 px-3 py-2">
                  <div>
                    <span className="font-semibold">{p.productName}</span>
                    {p.sku ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {p.sku}
                      </span>
                    ) : null}
                  </div>
                  {(() => {
                    const t = productTotals(p);
                    return (
                  <div className="flex flex-wrap gap-3 text-xs tabular-nums">
                    <span>
                      Open <strong>{qty(t.opening)}</strong>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      In +{qty(t.qtyIn)}
                    </span>
                    <span className="text-red-700 dark:text-red-400">
                      Out −{qty(t.qtyOut)}
                    </span>
                    <span>
                      Net {qty(t.net)}
                    </span>
                    <span className="font-semibold">
                      Close {qty(t.closing)}
                    </span>
                  </div>
                    );
                  })()}
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-secondary/20 text-left text-muted-foreground">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Whse</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Before</th>
                      <th className="p-2 text-right">After</th>
                      <th className="p-2">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.movements.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="whitespace-nowrap p-1.5">{m.date}</td>
                        <td className="p-1.5">{m.movementType}</td>
                        <td className="p-1.5">{m.warehouseName}</td>
                        <td className="p-1.5 text-right tabular-nums">
                          {qty(m.quantity)}
                        </td>
                        <td className="p-1.5 text-right tabular-nums text-muted-foreground">
                          {qty(m.balanceBefore)}
                        </td>
                        <td className="p-1.5 text-right tabular-nums font-medium">
                          {qty(m.balanceAfter)}
                        </td>
                        <td className="p-1.5 text-muted-foreground">
                          {m.reference ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
