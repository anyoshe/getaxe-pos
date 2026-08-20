"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductContext, ProductType } from "../../../types";
import { createProductsBatchAction, lookupProductCodeAction } from "../../../actions";
import { BarcodeScanner } from "./barcode-scanner";

type BatchRow = {
  id: string; name: string; barcode: string; sku: string; costPrice: string;
  sellingPrice: string;
  categoryId: string; productType: ProductType; status: "new" | "duplicate" | "ok"; note?: string;
};

function newRow(partial?: Partial<BatchRow>): BatchRow {
  return {
    id: crypto.randomUUID(), name: "", barcode: "", sku: "", costPrice: "",
    sellingPrice: "",
    categoryId: "", productType: "physical", status: "new", ...partial,
  };
}

export function BatchProductEntry({ context, onSuccess }: { context: ProductContext; onSuccess: () => void }) {
  const defaultCategory = context.categories[0]?.id ?? "";
  const [rows, setRows] = useState<BatchRow[]>([newRow({ categoryId: defaultCategory })]);
  const [showScanner, setShowScanner] = useState(false);
  const [pending, startTransition] = useTransition();
  const validCount = useMemo(
    () => rows.filter((r) => r.name.trim().length >= 2 && r.categoryId && r.status !== "duplicate").length,
    [rows],
  );

  function updateRow(id: string, patch: Partial<BatchRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }
  function addEmptyRow() { setRows((prev) => [...prev, newRow({ categoryId: defaultCategory })]); }
  function removeRow(id: string) { setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id))); }

  async function handleScan(code: string) {
    if (rows.some((r) => r.barcode === code || r.sku === code)) {
      toast.message(`Code ${code} already in this batch.`);
      return;
    }
    const result = await lookupProductCodeAction(code);
    if (result.product) {
      setRows((prev) => [
        ...prev.filter((r) => r.name || r.barcode || r.sku),
        newRow({
          name: result.product!.name, barcode: result.product!.barcode ?? code, sku: result.product!.sku ?? "",
          costPrice: result.product!.costPrice != null ? String(result.product!.costPrice) : "",
          categoryId: result.product!.categoryId,
          productType: (result.product!.productType as ProductType) ?? "physical",
          status: "duplicate", note: "Already in catalog — will be skipped",
        }),
      ]);
      toast.message(`${result.product.name} already exists — marked to skip.`);
      return;
    }
    setRows((prev) => {
      const blank = prev.find((r) => !r.name && !r.barcode && !r.sku);
      const row = newRow({ barcode: code, categoryId: defaultCategory, status: "ok", note: "New — enter name" });
      if (blank) return prev.map((r) => (r.id === blank.id ? { ...row, id: blank.id } : r));
      return [...prev, row];
    });
  }

  function saveAll() {
    const payload = rows
      .filter((r) => r.status !== "duplicate" && r.name.trim().length >= 2 && r.categoryId)
      .map((r) => ({
        productType: r.productType, categoryId: r.categoryId, name: r.name.trim(),
        barcode: r.barcode.trim() || null, sku: r.sku.trim() || null,
        costPrice: r.costPrice ? Number(r.costPrice) : null,
        sellingPrice: r.sellingPrice ? Number(r.sellingPrice) : null,
        supplierId: null, manufacturerId: null, drugCategoryId: null, dosageFormId: null,
        drugStrengthId: null, prescriptionTypeId: null, purchaseUnitId: null, salesUnitId: null,
        stockUnitId: null, incomeAccountId: null, expenseAccountId: null, inventoryAccountId: null,
        taxRateId: null, genericName: null, productBrand: null, description: null, packSize: null,
        trackInventory: true, trackBatch: false, trackExpiry: false, serialized: false,
        allowNegativeStock: false, minimumStock: 0, reorderLevel: 0, active: true,
      }));
    if (payload.length === 0) { toast.error("Add at least one complete product (name + category)."); return; }
    startTransition(async () => {
      const result = await createProductsBatchAction(payload);
      if (!result.success) { toast.error(result.message); return; }
      toast.success(result.message);
      onSuccess();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Batch product entry</h3>
          <p className="text-sm text-muted-foreground">Add many products, scan barcodes, review, then save all.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setShowScanner((v) => !v)}>{showScanner ? "Hide scanner" : "Scan codes"}</Button>
          <Button type="button" variant="outline" onClick={addEmptyRow}>Add row</Button>
        </div>
      </div>
      {showScanner && <BarcodeScanner continuous onScan={(code) => void handleScan(code)} onClose={() => setShowScanner(false)} />}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-2 font-medium">Name</th><th className="p-2 font-medium">Barcode</th>
              <th className="p-2 font-medium">SKU</th><th className="p-2 font-medium">Cost</th><th className="p-2 font-medium">Sell</th>
              <th className="p-2 font-medium">Category</th><th className="p-2 font-medium">Status</th><th className="p-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-2"><Input value={row.name} onChange={(e) => updateRow(row.id, { name: e.target.value, status: row.status === "duplicate" ? row.status : "ok" })} placeholder="Product name" disabled={row.status === "duplicate"} /></td>
                <td className="p-2"><Input value={row.barcode} onChange={(e) => updateRow(row.id, { barcode: e.target.value })} placeholder="Barcode" disabled={row.status === "duplicate"} /></td>
                <td className="p-2"><Input value={row.sku} onChange={(e) => updateRow(row.id, { sku: e.target.value })} placeholder="SKU" disabled={row.status === "duplicate"} /></td>
                <td className="p-2"><Input value={row.costPrice} onChange={(e) => updateRow(row.id, { costPrice: e.target.value })} placeholder="0.00" disabled={row.status === "duplicate"} /></td>
                <td className="p-2"><Input value={row.sellingPrice} onChange={(e) => updateRow(row.id, { sellingPrice: e.target.value })} placeholder="0.00" disabled={row.status === "duplicate"} /></td>
                <td className="p-2">
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={row.categoryId} disabled={row.status === "duplicate"} onChange={(e) => updateRow(row.id, { categoryId: e.target.value })}>
                    <option value="">Select…</option>
                    {context.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="p-2 text-xs text-muted-foreground">{row.status === "duplicate" ? "Skip (exists)" : (row.note ?? "—")}</td>
                <td className="p-2"><Button type="button" variant="ghost" size="sm" onClick={() => removeRow(row.id)}>Remove</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">{validCount} ready to save</p>
        <Button type="button" disabled={pending || validCount === 0} onClick={saveAll}>{pending ? "Saving…" : `Save ${validCount} product(s)`}</Button>
      </div>
    </div>
  );
}
