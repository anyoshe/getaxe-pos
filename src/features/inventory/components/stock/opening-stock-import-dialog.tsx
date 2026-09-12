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
} from "../../import/opening-stock-import-columns";
import {
  downloadCsv,
  downloadXlsxFromCsvText,
  parseSpreadsheetFile,
  SPREADSHEET_ACCEPT,
} from "@/lib/spreadsheet";
import {
  validateOpeningStockImportAction,
  type OpeningStockRowResult,
} from "../../actions/validate-opening-stock-import";
import { commitOpeningStockImportAction } from "../../actions/commit-opening-stock-import";

type RowResult = OpeningStockRowResult & {
  /** Set after successful receive — blocks double import */
  received?: boolean;
};

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
  const [results, setResults] = useState<RowResult[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const pendingRows = useMemo(
    () => results.filter((r) => r.ok && !r.received && r.payload),
    [results],
  );
  const receivedCount = useMemo(
    () => results.filter((r) => r.received).length,
    [results],
  );
  const badRows = useMemo(() => results.filter((r) => !r.ok), [results]);

  function downloadTemplateCsv() {
    downloadCsv("getaxe-opening-stock-template.csv", OPENING_STOCK_TEMPLATE_CSV);
  }

  function downloadTemplateXlsx() {
    downloadXlsxFromCsvText(
      "getaxe-opening-stock-template.xlsx",
      "Opening stock",
      OPENING_STOCK_TEMPLATE_CSV,
    );
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    try {
      const { rows } = await parseSpreadsheetFile(file);
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
    } catch (e) {
      setValidating(false);
      toast.error(
        e instanceof Error ? e.message : "Could not read the spreadsheet.",
      );
    }
  }

  async function commit() {
    const payloads = pendingRows
      .map((r) => r.payload)
      .filter(Boolean) as Record<string, unknown>[];
    if (payloads.length === 0) {
      toast.error("Nothing left to receive. Close and re-upload only if you need more stock.");
      return;
    }
    setImporting(true);
    try {
      const chunkSize = 5;
      let totalOk = 0;
      let totalFail = 0;
      const next: RowResult[] = results.map((r) => ({ ...r }));
      // Indices of rows still pending receive, in table order
      const pendingIdx = next
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.ok && !r.received && r.payload)
        .map(({ i }) => i);
      let cursor = 0;

      for (let offset = 0; offset < payloads.length; offset += chunkSize) {
        const chunk = payloads.slice(offset, offset + chunkSize);
        const res = await commitOpeningStockImportAction(chunk);

        for (const c of res.results ?? []) {
          if (cursor >= pendingIdx.length) break;
          const rowIndex = pendingIdx[cursor];
          cursor += 1;
          if (c.success) {
            totalOk += 1;
            next[rowIndex] = {
              ...next[rowIndex],
              received: true,
              payload: undefined,
              errors: [],
            };
          } else {
            totalFail += 1;
            next[rowIndex] = {
              ...next[rowIndex],
              ok: false,
              received: false,
              errors: [c.message || "Failed."],
              payload: undefined,
            };
          }
        }
        setResults([...next]);
      }

      if (totalFail === 0 && totalOk > 0) {
        toast.success(`${totalOk} opening stock line(s) received. Safe to close.`);
        onImported?.();
      } else if (totalOk > 0) {
        toast.message(`${totalOk} received, ${totalFail} failed. Failed lines can be fixed and re-uploaded.`);
        onImported?.();
      } else {
        toast.error(
          totalFail > 0
            ? `All ${totalFail} line(s) failed. See status column.`
            : "Receive did not complete. Try again with fewer rows.",
        );
      }
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Receive timed out or failed. Try again, or import fewer rows.",
      );
    } finally {
      setImporting(false);
    }
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
          <Button type="button" variant="outline" className="rounded-xl" onClick={downloadTemplateCsv}>
            <Download className="mr-2 h-4 w-4" />
            Template (CSV)
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={downloadTemplateXlsx}>
            <Download className="mr-2 h-4 w-4" />
            Template (Excel)
          </Button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">
            <Upload className="h-4 w-4" />
            {validating ? "Validating…" : "Choose Excel / CSV"}
            <input
              type="file"
              accept={SPREADSHEET_ACCEPT}
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
                {pendingRows.length} ready to receive · {receivedCount} already received
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
                        {r.received ? (
                          <span className="font-medium text-chart-4">Received</span>
                        ) : r.ok ? (
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
                disabled={pendingRows.length === 0 || importing}
                onClick={() => void commit()}
              >
                {importing
                  ? "Receiving…"
                  : pendingRows.length === 0 && receivedCount > 0
                    ? "All lines received"
                    : `Receive ${pendingRows.length} line${pendingRows.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Download CSV or Excel template, fill opening quantities, then upload either format.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
