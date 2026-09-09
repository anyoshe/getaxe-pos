"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadXlsx } from "@/lib/spreadsheet";

import { getStockMovementMatrixAction } from "../actions/operational-reports";

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function monthStartNairobi() {
  const t = todayNairobi();
  return t.slice(0, 8) + "01";
}

type MatrixData = Extract<
  Awaited<ReturnType<typeof getStockMovementMatrixAction>>,
  { success: true }
>["data"];

export function StockMovementMatrixReport() {
  const [fromDate, setFromDate] = useState(monthStartNairobi());
  const [toDate, setToDate] = useState(todayNairobi());
  const [data, setData] = useState<MatrixData | null>(null);
  const [pending, start] = useTransition();

  function load() {
    start(async () => {
      const r = await getStockMovementMatrixAction({ fromDate, toDate });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setData(r.data);
    });
  }

  function exportExcel() {
    if (!data) return;
    const rows = data.rows.map((r) => {
      const row: Record<string, string | number> = {
        "#": r.serial,
        Product: r.productName,
        SKU: r.sku ?? "",
        Opening: Number(r.opening.toFixed(3)),
        "Total in": Number(r.totalIn.toFixed(3)),
        "Total out": Number(r.totalOut.toFixed(3)),
        "Net movement": Number(r.net.toFixed(3)),
      };
      for (const b of r.buckets) {
        row[b.label] = Number(b.net.toFixed(3));
      }
      row["Closing"] = Number(r.closing.toFixed(3));
      row["Sales qty"] = Number(r.salesQty.toFixed(3));
      row["Sales amount"] = Number(r.salesAmount.toFixed(2));
      row["Cost"] = Number(r.cost.toFixed(2));
      row["Margin"] = Number(r.margin.toFixed(2));
      row["Margin %"] = Number(r.marginPct.toFixed(1));
      return row;
    });
    downloadXlsx(
      `stock-matrix-${data.fromDate}-to-${data.toDate}.xlsx`,
      "Stock matrix",
      rows,
    );
  }

  const granLabel =
    data?.granularity === "day"
      ? "Daily columns"
      : data?.granularity === "week"
        ? "Weekly columns"
        : data?.granularity === "month"
          ? "Monthly columns"
          : "";

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Stock movement matrix
        </h2>
        <p className="text-sm text-muted-foreground">
          One row per product. Net quantity by day (≤14 days), week (≤90 days),
          or month (longer ranges). Opening, closing, sales amount and margin
          for analysis — use the detail report below for line-by-line audit.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
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
        <Button type="button" disabled={pending} onClick={load}>
          {pending ? "Loading…" : "Run matrix"}
        </Button>
        {data ? (
          <Button type="button" variant="outline" onClick={exportExcel}>
            Excel
          </Button>
        ) : null}
      </div>

      {data ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {data.fromDate} → {data.toDate} · {granLabel} · {data.rows.length}{" "}
            product(s)
          </p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[960px] text-left text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2 text-right">Opening</th>
                  <th className="p-2 text-right">In</th>
                  <th className="p-2 text-right">Out</th>
                  <th className="p-2 text-right">Net</th>
                  {data.bucketLabels.map((b) => (
                    <th key={b.key} className="p-2 text-right whitespace-nowrap">
                      {b.label}
                    </th>
                  ))}
                  <th className="p-2 text-right">Closing</th>
                  <th className="p-2 text-right">Sales amt</th>
                  <th className="p-2 text-right">Margin</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.productId} className="border-t">
                    <td className="p-2 tabular-nums text-muted-foreground">
                      {r.serial}
                    </td>
                    <td className="max-w-[12rem] truncate p-2 font-medium">
                      {r.productName}
                    </td>
                    <td className="p-2 font-mono text-[10px]">{r.sku ?? "—"}</td>
                    <td className="p-2 text-right tabular-nums">
                      {r.opening.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right tabular-nums text-chart-4">
                      {r.totalIn.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right tabular-nums text-destructive">
                      {r.totalOut.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right font-semibold tabular-nums">
                      {r.net.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    {r.buckets.map((b) => (
                      <td
                        key={b.key}
                        className="p-2 text-right tabular-nums text-muted-foreground"
                      >
                        {b.net === 0
                          ? "—"
                          : b.net.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                      </td>
                    ))}
                    <td className="p-2 text-right font-semibold tabular-nums">
                      {r.closing.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {r.salesAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {r.margin.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a period and run the matrix. Short ranges use daily net columns;
          up to ~3 months use weeks; longer ranges use months.
        </p>
      )}
    </div>
  );
}
