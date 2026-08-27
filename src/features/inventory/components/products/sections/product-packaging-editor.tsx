"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  listProductUnitsAction,
  upsertProductUnitAction,
} from "../../../actions/product-units";

type UnitOption = { id: string; name: string; code?: string };

type Row = {
  unitId: string;
  factorToStock: number;
  isStockUnit: boolean;
  isPurchaseDefault: boolean;
  isSalesDefault: boolean;
  label: string;
};

/**
 * Manage product packaging conversions (e.g. 1 BOX = 100 CAP).
 * Available after product is saved (needs productId).
 */
export function ProductPackagingEditor({
  productId,
  units,
}: {
  productId: string;
  units: UnitOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<Row[]>([]);
  const [unitId, setUnitId] = useState("");
  const [factor, setFactor] = useState("1");
  const [allowSale, setAllowSale] = useState(true);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [isSalesDefault, setIsSalesDefault] = useState(false);
  const [isPurchaseDefault, setIsPurchaseDefault] = useState(false);

  function reload() {
    startTransition(async () => {
      const result = await listProductUnitsAction(productId);
      if (!result.success) return;
      setRows(
        result.units.map((u) => {
          const meta = units.find((x) => x.id === u.unitId);
          return {
            unitId: u.unitId,
            factorToStock: Number(u.factorToStock),
            isStockUnit: u.isStockUnit,
            isPurchaseDefault: u.isPurchaseDefault,
            isSalesDefault: u.isSalesDefault,
            label: meta?.name ?? meta?.code ?? u.unitId.slice(0, 8),
          };
        }),
      );
    });
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function onAdd() {
    if (!unitId) {
      toast.error("Select a unit.");
      return;
    }
    const f = Number(factor);
    if (!Number.isFinite(f) || f <= 0) {
      toast.error("Factor must be a positive number.");
      return;
    }
    startTransition(async () => {
      const existing = rows.find((r) => r.unitId === unitId);
      const result = await upsertProductUnitAction({
        productId,
        unitId,
        factorToStock: f,
        isStockUnit: false,
        isSalesDefault,
        isPurchaseDefault,
        allowSale,
        allowPurchase,
        supersede: Boolean(existing && existing.factorToStock !== f),
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setFactor("1");
      reload();
    });
  }

  return (
    <div className="mt-6 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div>
        <h3 className="text-sm font-semibold">Packaging conversions</h3>
        <p className="text-xs text-muted-foreground">
          Map supplier or sales packs to the stock unit. Example: 1 Box = 100
          capsules. Inventory always stores the stock unit.
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="space-y-1 text-sm">
          {rows.map((r) => (
            <li
              key={r.unitId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-card px-3 py-2"
            >
              <span>
                <strong>{r.label}</strong>
                {r.isStockUnit ? " (stock)" : ""}
                {r.isSalesDefault ? " · default sale" : ""}
                {r.isPurchaseDefault ? " · default purchase" : ""}
              </span>
              <span className="font-mono text-xs">
                1 = {r.factorToStock} stock unit(s)
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Unit</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <option value="">Select…</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Factor to stock unit</Label>
          <Input
            type="number"
            step="any"
            min="0"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            placeholder="e.g. 100"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowSale}
            onChange={(e) => setAllowSale(e.target.checked)}
          />
          Allow on sales / POS
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allowPurchase}
            onChange={(e) => setAllowPurchase(e.target.checked)}
          />
          Allow on receive
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
        <div className="sm:col-span-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => onAdd()}
          >
            {pending ? "Saving…" : "Add / update packaging unit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
