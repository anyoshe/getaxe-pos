"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createProductAction } from "../../actions";
import type { ProductContext, ProductType } from "../../types";
import {
  buildProductCreateDefaults,
  isQuickAddFriendlyType,
  writeStickyProductPrefs,
} from "./product-create-defaults";

type Props = {
  context: ProductContext;
  /** Optional scan / sticky prefill */
  initial?: Partial<{
    productType: ProductType;
    name: string;
    barcode: string;
    sku: string;
    categoryId: string;
    costPrice: number | null;
    sellingPrice: number | null;
  }>;
  onSuccess: (saved: {
    productType: ProductType;
    categoryId: string;
    stockUnitId: string | null;
  }) => void;
  onOpenFullForm: (type: ProductType) => void;
};

/**
 * One-screen create for common physical/service items.
 * Same createProductAction + validation as the full wizard.
 */
export function ProductQuickAdd({
  context,
  initial,
  onSuccess,
  onOpenFullForm,
}: Props) {
  const defaults = useMemo(
    () =>
      buildProductCreateDefaults(context, {
        productType: initial?.productType ?? null,
        name: initial?.name,
        barcode: initial?.barcode ?? null,
        sku: initial?.sku ?? null,
        categoryId: initial?.categoryId,
        costPrice: initial?.costPrice ?? null,
        sellingPrice: initial?.sellingPrice ?? null,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sticky read once per mount
    [context, initial?.barcode, initial?.productType],
  );

  const [name, setName] = useState(defaults.name);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [productType, setProductType] = useState<ProductType>(
    (defaults.productType as ProductType) || "physical",
  );
  const [sku, setSku] = useState(defaults.sku ?? "");
  const [barcode, setBarcode] = useState(defaults.barcode ?? "");
  const [costPrice, setCostPrice] = useState(
    defaults.costPrice != null ? String(defaults.costPrice) : "",
  );
  const [sellingPrice, setSellingPrice] = useState(
    defaults.sellingPrice != null ? String(defaults.sellingPrice) : "",
  );
  const [trackInventory, setTrackInventory] = useState(
    defaults.trackInventory,
  );
  const [stockUnitId, setStockUnitId] = useState(defaults.stockUnitId ?? "");
  const [showMore, setShowMore] = useState(false);
  const [trackBatch, setTrackBatch] = useState(defaults.trackBatch);
  const [trackExpiry, setTrackExpiry] = useState(defaults.trackExpiry);
  const [reorderLevel, setReorderLevel] = useState(String(defaults.reorderLevel || 0));
  const [pending, startTransition] = useTransition();

  const types = (context.productTypes?.length
    ? context.productTypes
    : (["physical", "service"] as ProductType[])
  ).filter((t) => t !== "medicine"); // medicine → full form

  function resetForNext(sticky: {
    productType: ProductType;
    categoryId: string;
    stockUnitId: string | null;
  }) {
    setName("");
    setSku("");
    setBarcode("");
    setCostPrice("");
    setSellingPrice("");
    setCategoryId(sticky.categoryId);
    setProductType(sticky.productType);
    setStockUnitId(sticky.stockUnitId ?? "");
    setTrackInventory(sticky.productType !== "service");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isQuickAddFriendlyType(productType)) {
      onOpenFullForm(productType);
      return;
    }
    if (!categoryId) {
      toast.error("Select a category (or create categories first).");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Enter a product name (at least 2 characters).");
      return;
    }

    startTransition(async () => {
      const base = buildProductCreateDefaults(context, {
        productType,
        categoryId,
        name: name.trim(),
        sku: sku.trim() || null,
        barcode: barcode.trim() || null,
        costPrice: costPrice === "" ? null : Number(costPrice),
        sellingPrice: sellingPrice === "" ? null : Number(sellingPrice),
        trackInventory: productType === "service" ? false : trackInventory,
        trackBatch,
        trackExpiry,
        stockUnitId: stockUnitId || null,
        salesUnitId: stockUnitId || null,
        purchaseUnitId: stockUnitId || null,
        reorderLevel: Number(reorderLevel) || 0,
        minimumStock: 0,
        active: true,
        serialized: false,
        allowNegativeStock: false,
      });

      const formData = new FormData();
      for (const [key, value] of Object.entries(base)) {
        if (value === null || value === undefined) continue;
        formData.append(key, String(value));
      }
      // booleans must be "true"/"false" strings for the action
      formData.set("trackInventory", String(base.trackInventory));
      formData.set("trackBatch", String(base.trackBatch));
      formData.set("trackExpiry", String(base.trackExpiry));
      formData.set("serialized", "false");
      formData.set("allowNegativeStock", "false");
      formData.set("active", "true");
      formData.set("isControlled", "false");
      if (base.sellingPrice != null) {
        formData.set("sellingPrice", String(base.sellingPrice));
      }

      const result = await createProductAction(formData);
      if (!result.success) {
        toast.error(result.message ?? "Could not create product.");
        return;
      }

      writeStickyProductPrefs({
        productType,
        categoryId,
        stockUnitId: stockUnitId || null,
        salesUnitId: stockUnitId || null,
        purchaseUnitId: stockUnitId || null,
        trackInventory: base.trackInventory,
        trackBatch,
        trackExpiry,
      });

      toast.success(result.message ?? "Product created");
      const sticky = {
        productType,
        categoryId,
        stockUnitId: stockUnitId || null,
      };
      resetForNext(sticky);
      onSuccess(sticky);
    });
  }

  if (context.categories.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-medium text-foreground">Create a category first</p>
        <p className="text-muted-foreground">
          Products need a category for markups and reporting. Add one, then come
          back to quick-add.
        </p>
        <Link
          href="/inventory/categories"
          className="inline-flex text-indigo-600 hover:underline"
        >
          Go to categories →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        Quick add fills units and tracking for you. Use{" "}
        <button
          type="button"
          className="font-medium text-indigo-600 hover:underline"
          onClick={() => onOpenFullForm(productType)}
        >
          full form
        </button>{" "}
        for medicine, packaging, or accounts.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="qa-name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="qa-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paracetamol 500mg tabs"
            autoFocus
            required
            minLength={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-type">Type</Label>
          <select
            id="qa-type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={productType}
            onChange={(e) => {
              const t = e.target.value as ProductType;
              setProductType(t);
              setTrackInventory(t !== "service");
            }}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-cat">
            Category <span className="text-destructive">*</span>
          </Label>
          <select
            id="qa-cat"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {context.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-sell">Selling price (KES)</Label>
          <Input
            id="qa-sell"
            type="number"
            min={0}
            step="0.01"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-cost">Cost price (KES)</Label>
          <Input
            id="qa-cost"
            type="number"
            min={0}
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-sku">SKU</Label>
          <Input
            id="qa-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="qa-barcode">Barcode</Label>
          <Input
            id="qa-barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {productType !== "service" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={trackInventory}
            onChange={(e) => setTrackInventory(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Track inventory (stock on hand)
        </label>
      )}

      <button
        type="button"
        className="text-xs font-medium text-indigo-600 hover:underline"
        onClick={() => setShowMore((v) => !v)}
      >
        {showMore ? "Hide more options" : "More options"}
      </button>

      {showMore && (
        <div className="grid gap-3 rounded-lg border border-border/60 bg-card/50 p-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="qa-unit">Stock unit</Label>
            <select
              id="qa-unit"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={stockUnitId}
              onChange={(e) => setStockUnitId(e.target.value)}
            >
              <option value="">Default</option>
              {context.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.code ? ` (${u.code})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-reorder">Reorder level</Label>
            <Input
              id="qa-reorder"
              type="number"
              min={0}
              step={1}
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trackBatch}
              onChange={(e) => setTrackBatch(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Track batches
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={trackExpiry}
              onChange={(e) => setTrackExpiry(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Track expiry
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onOpenFullForm(productType)}
        >
          Full form
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save & add another"}
        </Button>
      </div>
    </form>
  );
}
