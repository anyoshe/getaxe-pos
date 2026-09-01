"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  listProductUnitsAction,
  upsertProductUnitAction,
} from "../../../actions/product-units";

export type PackagingLineDraft = {
  unitId: string;
  unitLabel?: string;
  factorToStock: number;
  isStockUnit: boolean;
  isPurchaseDefault: boolean;
  isSalesDefault: boolean;
  allowPurchase: boolean;
  allowSale: boolean;
};

type UnitOpt = { id: string; name: string; code?: string | null };

type SavedRow = {
  unitId: string;
  unitName?: string | null;
  unitCode?: string | null;
  factorToStock: string | number;
  isStockUnit: boolean;
  isPurchaseDefault: boolean;
  isSalesDefault: boolean;
  allowPurchase: boolean;
  allowSale: boolean;
};

/**
 * Packaging conversions (e.g. 1 BOX = 100 CAP).
 * - Edit mode (productId): load/save via server actions
 * - Create mode: draft lines held in parent until product is saved
 */
export function ProductPackagingEditor({
  productId,
  units,
  draftLines = [],
  onDraftChange,
}: {
  productId?: string | null;
  units: UnitOpt[];
  draftLines?: PackagingLineDraft[];
  onDraftChange?: (lines: PackagingLineDraft[]) => void;
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [unitId, setUnitId] = useState("");
  const [factor, setFactor] = useState("1");
  const [isStockUnit, setIsStockUnit] = useState(false);
  const [isPurchaseDefault, setIsPurchaseDefault] = useState(false);
  const [isSalesDefault, setIsSalesDefault] = useState(false);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [allowSale, setAllowSale] = useState(true);

  const isDraft = !productId;

  const load = useCallback(async () => {
    if (!productId) return;
    const result = await listProductUnitsAction(productId);
    if (result.success && Array.isArray((result as { units?: SavedRow[] }).units)) {
      setSaved((result as { units: SavedRow[] }).units);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unitLabel = (unitId: string, fallbackName?: string | null, fallbackCode?: string | null) => {
    const fromProp = units.find((x) => x.id === unitId);
    const name = (fallbackName || fromProp?.name || "").trim();
    const code = (fallbackCode || fromProp?.code || "").trim();
    if (name && code) return `${name} (${code})`;
    if (name) return name;
    if (code) return code;
    return "Unknown unit";
  };

  const displayRows: Array<{
    unitId: string;
    label: string;
    factorToStock: number;
    isStockUnit: boolean;
    isPurchaseDefault: boolean;
    isSalesDefault: boolean;
  }> = isDraft
    ? draftLines.map((l) => ({
        unitId: l.unitId,
        label: l.unitLabel || unitLabel(l.unitId),
        factorToStock: l.factorToStock,
        isStockUnit: l.isStockUnit,
        isPurchaseDefault: l.isPurchaseDefault,
        isSalesDefault: l.isSalesDefault,
      }))
    : saved.map((r) => ({
        unitId: r.unitId,
        label: unitLabel(r.unitId, r.unitName, r.unitCode),
        factorToStock: Number(r.factorToStock),
        isStockUnit: r.isStockUnit,
        isPurchaseDefault: r.isPurchaseDefault,
        isSalesDefault: r.isSalesDefault,
      }));

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!unitId) {
      toast.error("Select a unit.");
      return;
    }
    const factorToStock = Number(factor);
    if (!(factorToStock > 0)) {
      toast.error("Factor must be greater than zero.");
      return;
    }
    if (isStockUnit && factorToStock !== 1) {
      toast.error("Stock unit must have factor 1 (one piece = one stock unit).");
      return;
    }
    if (!isStockUnit && factorToStock <= 1) {
      toast.error(
        "Pack unit must contain more than 1 piece (e.g. box = 50 tablets). Factor 1 means it is the stock unit — tick “stock unit” instead.",
      );
      return;
    }

    if (isDraft) {
      const next: PackagingLineDraft = {
        unitId,
        unitLabel: unitLabel(unitId),
        factorToStock,
        isStockUnit,
        isPurchaseDefault,
        isSalesDefault,
        allowPurchase,
        allowSale,
      };
      const without = draftLines.filter((l) => l.unitId !== unitId);
      onDraftChange?.([...without, next]);
      toast.success("Packaging line added — will save when you create the product.");
      setFactor("1");
      setIsStockUnit(false);
      return;
    }

    start(async () => {
      const result = await upsertProductUnitAction({
        productId,
        unitId,
        factorToStock,
        isStockUnit,
        isPurchaseDefault,
        isSalesDefault,
        allowPurchase,
        allowSale,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message ?? "Saved.");
      await load();
    });
  }

  function removeDraft(id: string) {
    onDraftChange?.(draftLines.filter((l) => l.unitId !== id));
  }

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
      <div>
        <h3 className="text-sm font-semibold">Packaging conversions</h3>
        <p className="text-xs text-muted-foreground">
          Stock is always counted in the <strong>smallest sellable piece</strong>{" "}
          (tablet, capsule, piece). Packs only store how many pieces are inside.
          Example: stock = tablet; strip = <strong>10</strong>; box ={" "}
          <strong>50</strong> → ordering 2 boxes adds 100 tablets to stock.
          {isDraft
            ? " Draft lines save when you create the product."
            : " Changes save immediately."}
        </p>
        <div className="rounded-lg border border-primary/20 bg-background/80 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Pricing rule:</strong> if one tablet
          costs 40 and one box has 50 tablets, supplier price for 1 box ={" "}
          <strong className="text-foreground">2,000</strong> (50 × 40). On a PO,
          choose unit <em>Box</em>, qty = number of boxes, cost = 2,000 per box.
          Never set box factor = 1 unless the product is only sold as whole boxes
          with no piece tracking.
        </div>
      </div>

      {displayRows.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {displayRows.map((r) => (
            <li
              key={r.unitId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2"
            >
              <span>
                <span className="font-medium">{r.label}</span>
                <span className="text-muted-foreground">
                  {" "}
                  → {r.factorToStock} stock unit(s)
                </span>
                {r.isStockUnit ? (
                  <span className="ml-2 text-[10px] uppercase text-primary">
                    stock
                  </span>
                ) : null}
                {r.isSalesDefault ? (
                  <span className="ml-1 text-[10px] uppercase text-muted-foreground">
                    sale default
                  </span>
                ) : null}
                {r.isPurchaseDefault ? (
                  <span className="ml-1 text-[10px] uppercase text-muted-foreground">
                    buy default
                  </span>
                ) : null}
              </span>
              {isDraft ? (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => removeDraft(r.unitId)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          No packaging lines yet. Add at least the stock unit (factor 1) and any
          sell/buy packs.
        </p>
      )}

      {/* Nested form avoided — use div + button to not nest <form> */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">Unit</span>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <option value="">Select unit…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {u.code ? ` (${u.code})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-muted-foreground">
            Pieces in ONE of this unit (e.g. 50 if 1 box = 50 tablets)
          </span>
          <Input
            type="number"
            min={0.000001}
            step="any"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isStockUnit}
            onChange={(e) => {
              setIsStockUnit(e.target.checked);
              if (e.target.checked) setFactor("1");
            }}
          />
          This is the stock / piece unit (always factor 1)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isSalesDefault}
            onChange={(e) => setIsSalesDefault(e.target.checked)}
          />
          Default sales unit
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPurchaseDefault}
            onChange={(e) => setIsPurchaseDefault(e.target.checked)}
          />
          Default purchase unit
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowSale}
            onChange={(e) => setAllowSale(e.target.checked)}
          />
          Allow sale
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowPurchase}
            onChange={(e) => setAllowPurchase(e.target.checked)}
          />
          Allow purchase
        </label>
      </div>
      <Button type="button" disabled={pending} onClick={onAdd}>
        {pending ? "Saving…" : isDraft ? "Add packaging line" : "Add / update packaging unit"}
      </Button>
    </div>
  );
}
