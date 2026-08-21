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
  quantityRemaining: number;
};

type WarehouseOption = { id: string; name: string };

interface AdjustStockFormProps {
  batches: BatchOption[];
  warehouses: WarehouseOption[];
}

export function AdjustStockForm({ batches, warehouses }: AdjustStockFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [batchId, setBatchId] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const batch = batches.find((b) => b.id === batchId);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await adjustStockAction({
        batchId,
        warehouseId,
        quantity: Number(quantity),
        reference: reference || null,
        notes: notes || null,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.push("/inventory/stock-movements");
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
            Increase or decrease quantity for an existing batch (damage, count
            correction, etc.). Use positive for increase, negative for decrease.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border p-5">
        <div className="space-y-2">
          <Label>
            Batch <span className="text-destructive">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            required
          >
            <option value="">Select batch…</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchNumber} — {b.productName} (rem {b.quantityRemaining})
              </option>
            ))}
          </select>
          {batch && (
            <p className="text-xs text-muted-foreground">
              Remaining on batch: {batch.quantityRemaining}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Warehouse <span className="text-destructive">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            required
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

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
        <Button type="submit" disabled={pending || !batchId}>
          {pending ? "Saving…" : "Apply adjustment"}
        </Button>
      </div>
    </form>
  );
}
