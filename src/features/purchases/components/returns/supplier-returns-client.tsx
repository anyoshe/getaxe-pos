"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createSupplierReturnAction } from "../../actions/purchasing-ui";

type Opt = { id: string; name: string };

export function SupplierReturnsClient({
  suppliers,
  products,
  warehouses,
}: {
  suppliers: Opt[];
  products: Opt[];
  warehouses: Opt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  function submit() {
    startTransition(async () => {
      const result = await createSupplierReturnAction({
        supplierId,
        warehouseId,
        notes: notes || null,
        items: [{ productId, quantity }],
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supplier returns</h1>
        <p className="text-sm text-muted-foreground">
          Return stock to suppliers and reduce on-hand inventory.
        </p>
      </div>

      <div className="grid max-w-xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="space-y-1">
          <Label>Supplier</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Warehouse</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Product</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Quantity (stock units)</Label>
          <Input
            type="number"
            min={1}
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label>Notes</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="button" disabled={pending} onClick={submit}>
          {pending ? "Saving…" : "Record supplier return"}
        </Button>
      </div>
    </div>
  );
}
