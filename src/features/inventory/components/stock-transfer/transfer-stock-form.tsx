"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { transferStockAction } from "../../actions/transfer-stock";

type BatchOption = {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  quantityRemaining: number;
};

type WarehouseOption = { id: string; name: string };

interface TransferStockFormProps {
  batches: BatchOption[];
  warehouses: WarehouseOption[];
}

export function TransferStockForm({
  batches,
  warehouses,
}: TransferStockFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [batchId, setBatchId] = useState("");
  const [fromWarehouseId, setFromWarehouseId] = useState(
    warehouses[0]?.id ?? "",
  );
  const [toWarehouseId, setToWarehouseId] = useState(warehouses[1]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const batch = batches.find((b) => b.id === batchId);

  const warehouseOptions = useMemo(() => warehouses, [warehouses]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batch) return;

    startTransition(async () => {
      const result = await transferStockAction({
        productId: batch.productId,
        batchId,
        fromWarehouseId,
        toWarehouseId,
        quantity: Number(quantity),
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
          <h1 className="text-xl font-semibold">Transfer stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Move quantity of a batch from one warehouse to another.
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              From warehouse <span className="text-destructive">*</span>
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={fromWarehouseId}
              onChange={(e) => setFromWarehouseId(e.target.value)}
              required
            >
              {warehouseOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              To warehouse <span className="text-destructive">*</span>
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={toWarehouseId}
              onChange={(e) => setToWarehouseId(e.target.value)}
              required
            >
              {warehouseOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Reference</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Transfer note #"
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
          {pending ? "Transferring…" : "Transfer"}
        </Button>
      </div>
    </form>
  );
}
