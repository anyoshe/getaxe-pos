"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { receiveStockAction } from "../../actions/receive-stock";
import type { Product } from "../../types";

type WarehouseOption = { id: string; name: string; code?: string | null };
type SupplierOption = { id: string; name: string };

interface ReceiveStockFormProps {
  products: Product[];
  warehouses: WarehouseOption[];
  suppliers: SupplierOption[];
}

export function ReceiveStockForm({
  products,
  warehouses,
  suppliers,
}: ReceiveStockFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const stockable = useMemo(
    () =>
      products.filter(
        (p) =>
          p.trackInventory &&
          p.productType !== "service" &&
          p.active !== false,
      ),
    [products],
  );

  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [movementType, setMovementType] = useState<
    "OPENING_STOCK" | "PURCHASE" | "ADJUSTMENT"
  >("PURCHASE");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const product = stockable.find((p) => p.id === productId);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await receiveStockAction({
        productId,
        warehouseId,
        quantity: Number(quantity),
        unitCost: unitCost === "" ? null : Number(unitCost),
        movementType,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        manufactureDate: manufactureDate || null,
        supplierId: supplierId || null,
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
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="overflow-hidden rounded-2xl brand-gradient p-[1px] shadow-sm">
        <div className="rounded-[0.95rem] bg-card px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Inventory
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Receive stock</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Put quantity into a warehouse. Batch and expiry are required only when
            the product is set up to track them.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-5">
        <div className="space-y-2">
          <Label>
            Product <span className="text-destructive">*</span>
          </Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = stockable.find((x) => x.id === e.target.value);
              if (p?.costPrice != null) setUnitCost(String(p.costPrice));
              if (p?.supplierId) setSupplierId(p.supplierId);
            }}
            required
          >
            <option value="">Select product…</option>
            {stockable.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.sku ? ` (${p.sku})` : ""}
              </option>
            ))}
          </select>
          {product && (
            <p className="text-xs text-muted-foreground">
              Tracking:{" "}
              {[
                product.trackInventory && "inventory",
                product.trackBatch && "batch",
                product.trackExpiry && "expiry",
                product.serialized && "serial",
              ]
                .filter(Boolean)
                .join(" · ") || "none"}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              <option value="">Select warehouse…</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Movement type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={movementType}
              onChange={(e) =>
                setMovementType(e.target.value as typeof movementType)
              }
            >
              <option value="PURCHASE">Purchase / delivery</option>
              <option value="OPENING_STOCK">Opening stock</option>
              <option value="ADJUSTMENT">Adjustment (in)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              Unit cost <span className="text-xs text-muted-foreground">optional</span>
            </Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {product?.trackBatch && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <Label>
              Batch number <span className="text-destructive">*</span>
            </Label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g. LOT-2026-001"
              required
            />
            <p className="text-xs text-muted-foreground">
              Required because this product tracks batches.
            </p>
          </div>
        )}

        {product?.trackExpiry && (
          <div className="grid gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Expiry date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Manufacture date{" "}
                <span className="text-xs text-muted-foreground">optional</span>
              </Label>
              <Input
                type="date"
                value={manufactureDate}
                onChange={(e) => setManufactureDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Supplier <span className="text-xs text-muted-foreground">optional</span>
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">None</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              Reference <span className="text-xs text-muted-foreground">optional</span>
            </Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Invoice / GRN no."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Notes <span className="text-xs text-muted-foreground">optional</span>
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/inventory/stock")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending || !productId || !warehouseId}>
          {pending ? "Receiving…" : "Receive stock"}
        </Button>
      </div>
    </form>
  );
}
