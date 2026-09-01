"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PRODUCT_IMPORT_TEMPLATE_CSV } from "../../import/product-import-columns";
import {
  validateProductImportAction,
  type ImportRowResult,
} from "../../actions/validate-product-import";
import { createProductsBatchAction } from "../../actions/create-products-batch";
import {
  downloadCsv,
  downloadXlsxFromCsvText,
  parseSpreadsheetFile,
  SPREADSHEET_ACCEPT,
} from "@/lib/spreadsheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
};

export function ProductImportDialog({ open, onOpenChange, onImported }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  const okRows = useMemo(() => results.filter((r) => r.ok), [results]);
  const badRows = useMemo(() => results.filter((r) => !r.ok), [results]);

  function downloadTemplateCsv() {
    downloadCsv("getaxe-product-import-template.csv", PRODUCT_IMPORT_TEMPLATE_CSV);
  }

  function downloadTemplateXlsx() {
    downloadXlsxFromCsvText(
      "getaxe-product-import-template.xlsx",
      "Products",
      PRODUCT_IMPORT_TEMPLATE_CSV,
    );
  }

  async function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    setResults([]);
    try {
      const { rows } = await parseSpreadsheetFile(file);
      if (rows.length === 0) {
        toast.error("No data rows found in the file.");
        return;
      }
      setValidating(true);
      const res = await validateProductImportAction(rows);
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

  async function commitImport() {
    const payloads = okRows
      .map((r) => r.payload)
      .filter(Boolean) as Record<string, unknown>[];
    if (payloads.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }
    setImporting(true);
    const res = await createProductsBatchAction(payloads);
    setImporting(false);
    if (!res.success && !res.results?.some((r) => r.success)) {
      toast.error(res.message ?? "Import failed.");
      return;
    }
    const ok = res.results?.filter((r) => r.success).length ?? 0;
    const fail = res.results?.filter((r) => !r.success).length ?? 0;
    toast.success(
      fail > 0
        ? `Imported ${ok} product(s); ${fail} failed.`
        : `Imported ${ok} product(s).`,
    );
    if (ok > 0) {
      setResults([]);
      setFileName(null);
      onImported?.();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-4xl flex-col gap-4 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import products
          </DialogTitle>
          <DialogDescription>
            Upload Excel (.xlsx) or CSV. Download a template, fill rows, then
            validate and import. Medicine rows need pharmacy catalogue fields when
            required by capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={downloadTemplateCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            Template (CSV)
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={downloadTemplateXlsx}
          >
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
            <span className="self-center text-xs text-muted-foreground">
              {fileName}
            </span>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          Use the first sheet. Header row required. Dates as YYYY-MM-DD. Leave
          unused columns blank.
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
            <div className="max-h-64 overflow-auto rounded-xl border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Name / SKU</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.index} className="border-t">
                      <td className="p-2 tabular-nums">{r.index + 1}</td>
                      <td className="p-2">
                        {r.preview?.name ??
                          (r.payload as { name?: string } | undefined)?.name ??
                          "—"}
                        {r.preview?.sku ? (
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            {r.preview.sku}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-2">
                        {r.ok ? (
                          <span className="text-chart-4">OK</span>
                        ) : (
                          <span className="text-destructive">
                            {r.errors?.join("; ") ?? "Invalid"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              disabled={importing || okRows.length === 0}
              onClick={() => void commitImport()}
            >
              {importing
                ? "Importing…"
                : `Import ${okRows.length} valid row(s)`}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
