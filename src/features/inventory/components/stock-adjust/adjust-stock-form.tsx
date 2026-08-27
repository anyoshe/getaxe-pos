"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { adjustStockAction } from "../../actions/adjust-stock";

type BatchOption = {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  /** Warehouse on-hand (source of truth), not batch.quantityRemaining alone */
  quantityRemaining: number;
  warehouseId?: string;
};

type WarehouseOption = { id: string; name: string };

interface AdjustStockFormProps {
  batches: BatchOption[];
  warehouses: WarehouseOption[];
  units?: { id: string; name: string }[];
}

export function AdjustStockForm({ batches, warehouses, units = [] }: AdjustStockFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectionKey, setSelectionKey] = useState("");
  const [quantity, setQuantity] = useState("-1");
  const [unitId, setUnitId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const selected = batches.find(
    (b) => `${b.id}:${b.warehouseId ?? ""}` === selectionKey,
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      toast.error("Select a batch / warehouse line.");
      return;
    }
    startTransition(async () => {
      const result = await adjustStockAction({
        batchId: selected.id,
        warehouseId: selected.warehouseId || warehouses[0]?.id,
        quantity: Number(quantity),
        unitId: unitId || null,
        reference: reference || null,
        notes: notes || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/inventory/stock");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="overflow-hidden rounded-2xl brand-gradient p-[1px]">
        <div className="rounded-[0.95rem] bg-card px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-xl font-semibold">Adjust stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quantities shown are <strong>warehouse on-hand</strong> (same as
            Stock on Hand). Use positive to increase, negative to decrease.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-5">
        <div className="space-y-2">
          <Label>
            Stock line <span className="text-destructive">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={selectionKey}
            onChange={(e) => setSelectionKey(e.target.value)}
            required
          >
            <option value="">Select…</option>
            {batches.map((b) => {
              const key = `${b.id}:${b.warehouseId ?? ""}`;
              const wh =
                warehouses.find((w) => w.id === b.warehouseId)?.name ??
                "Warehouse";
              return (
                <option key={key} value={key}>
                  {b.batchNumber} — {b.productName} @ {wh} (on hand{" "}
                  {b.quantityRemaining})
                </option>
              );
            })}
          </select>
          {selected && (
            <p className="text-xs text-muted-foreground">
              On hand: {selected.quantityRemaining} (warehouse balance)
            </p>
          )}
        </div>

        {units.length > 0 && (
          <div className="space-y-2">
            <Label>Unit (optional)</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">Stock unit (no conversion)</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Enter qty in this unit; system converts to stock units using product packaging.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label>
            Quantity change <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="+5 or -2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Reference</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Count sheet / reason code"
          />
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !selectionKey}>
          {pending ? "Saving…" : "Apply adjustment"}
        </Button>
      </div>
    </form>
  );
}
