"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, PackagePlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  OPENING_STOCK_TEMPLATE_CSV,
  parseOpeningStockCsv,
} from "../../import/opening-stock-import-columns";
import {
  validateOpeningStockImportAction,
  type OpeningStockRowResult,
} from "../../actions/validate-opening-stock-import";
import { commitOpeningStockImportAction } from "../../actions/commit-opening-stock-import";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
};

export function OpeningStockImportDialog({
  open,
  onOpenChange,
  onImported,
}: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<OpeningStockRowResult[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const okRows = useMemo(() => results.filter((r) => r.ok), [results]);
  const badRows = useMemo(() => results.filter((r) => !r.ok), [results]);

  function downloadTemplate() {
    const blob = new Blob([OPENING_STOCK_TEMPLATE_CSV], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "getaxe-opening-stock-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    const text = await file.text();
    const { rows } = parseOpeningStockCsv(text);
    if (rows.length === 0) {
      toast.error("No data rows found.");
      return;
    }
    setValidating(true);
    const res = await validateOpeningStockImportAction(rows);
    setValidating(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setResults(res.results);
    toast.message(res.message);
  }

  async function commit() {
    const payloads = okRows
      .map((r) => r.payload)
      .filter(Boolean) as Record<string, unknown>[];
    if (payloads.length === 0) {
      toast.error("No valid rows.");
      return;
    }
    setImporting(true);
    const res = await commitOpeningStockImportAction(payloads);
    setImporting(false);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);

    if (res.results?.length) {
      const next = [...results];
      let pi = 0;
      for (let i = 0; i < next.length; i++) {
        if (!next[i].ok) continue;
        const c = res.results[pi++];
        if (c && !c.success) {
          next[i] = {
            ...next[i],
            ok: false,
            errors: [c.message],
            payload: undefined,
          };
        }
      }
      setResults(next);
    }
    onImported?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-4xl flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            Import opening stock
          </DialogTitle>
          <DialogDescription>
            Receive existing stock into warehouses. Products must already exist.
            Batches, expiry, and serials follow each product&apos;s settings.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-xl" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download template
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" />
            {validating ? "Validating…" : "Choose CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={validating || importing}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {fileName ? (
            <span className="self-center text-xs text-muted-foreground">{fileName}</span>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          sku or barcode, warehouse (MAIN), quantity, unit, unitCost, batchNumber,
          manufactureDate, expiryDate, serialNumbers (use | between serials).
        </p>

        {results.length > 0 ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-chart-4/15 px-2.5 py-0.5 font-medium text-chart-4">
                {okRows.length} ready
              </span>
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 font-medium text-destructive">
                {badRows.length} errors
              </span>
            </div>
            <div className="max-h-[45vh] overflow-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b bg-muted/80">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Product</th>
                    <th className="p-2">SKU</th>
                    <th className="p-2">Warehouse</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.index} className={r.ok ? "border-b" : "border-b bg-destructive/5"}>
                      <td className="p-2 text-muted-foreground">{r.index + 1}</td>
                      <td className="p-2 font-medium">{r.preview?.product}</td>
                      <td className="p-2 font-mono text-xs">{r.preview?.sku}</td>
                      <td className="p-2 text-xs">{r.preview?.warehouse}</td>
                      <td className="p-2 tabular-nums">{r.preview?.quantity}</td>
                      <td className="p-2 text-xs">
                        {r.ok ? (
                          <span className="text-chart-4">Ready</span>
                        ) : (
                          <span className="text-destructive">{r.errors.join(" · ")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                type="button"
                className="rounded-xl"
                disabled={okRows.length === 0 || importing}
                onClick={() => void commit()}
              >
                {importing ? "Receiving…" : `Receive ${okRows.length} line${okRows.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Download the template, fill opening quantities, then upload.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
