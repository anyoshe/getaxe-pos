"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { receivePurchaseOrderAction } from "../../actions/purchasing-ui";

export type ReceivePo = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    receivedQuantity: number;
    unitCost: number;
  }[];
};

type Warehouse = { id: string; name: string };
type ReceiptRow = {
  id: string;
  receiptNumber: string;
  status: string;
  total: string | number;
  supplierName: string;
  receivedAt: string;
};

export function GoodsReceivingClient({
  purchaseOrders,
  warehouses,
  receipts,
}: {
  purchaseOrders: ReceivePo[];
  warehouses: Warehouse[];
  receipts: ReceiptRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const receivable = useMemo(
    () =>
      purchaseOrders.filter((p) =>
        ["APPROVED", "PARTIALLY_RECEIVED", "PENDING"].includes(p.status),
      ),
    [purchaseOrders],
  );
  const [poId, setPoId] = useState(receivable[0]?.id ?? "");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [invoice, setInvoice] = useState("");
  const [notes, setNotes] = useState("");

  const selected = receivable.find((p) => p.id === poId);

  const [qtys, setQtys] = useState<Record<string, number>>({});

  function openQty(productId: string, remaining: number) {
    return qtys[productId] ?? remaining;
  }

  function submit() {
    if (!selected || !warehouseId) {
      toast.error("Select a purchase order and warehouse.");
      return;
    }
    const items = selected.items
      .map((it) => {
        const remaining = Math.max(0, it.quantity - it.receivedQuantity);
        const q = openQty(it.productId, remaining);
        return {
          productId: it.productId,
          quantity: q,
          unitCost: it.unitCost,
        };
      })
      .filter((i) => i.quantity > 0);

    if (items.length === 0) {
      toast.error("Enter quantities to receive.");
      return;
    }

    startTransition(async () => {
      const result = await receivePurchaseOrderAction({
        purchaseOrderId: selected.id,
        warehouseId,
        supplierInvoiceNumber: invoice || null,
        notes: notes || null,
        items,
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
        <h1 className="text-2xl font-semibold tracking-tight">Goods received</h1>
        <p className="text-sm text-muted-foreground">
          Receive against approved purchase orders — stock is posted to inventory.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Purchase order</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={poId}
              onChange={(e) => setPoId(e.target.value)}
            >
              {receivable.length === 0 && (
                <option value="">No approved orders</option>
              )}
              {receivable.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.orderNumber} — {p.supplierName}
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
            <Label>Supplier invoice #</Label>
            <Input value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        {selected && (
          <div className="space-y-2">
            <Label>Quantities to receive (stock units)</Label>
            {selected.items.map((it) => {
              const remaining = Math.max(0, it.quantity - it.receivedQuantity);
              return (
                <div
                  key={it.productId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{it.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      Ordered {it.quantity} · Received {it.receivedQuantity} ·
                      Remaining {remaining} · Cost {it.unitCost}
                    </div>
                  </div>
                  <Input
                    className="w-28"
                    type="number"
                    min={0}
                    max={remaining || undefined}
                    step="any"
                    value={openQty(it.productId, remaining)}
                    onChange={(e) =>
                      setQtys((prev) => ({
                        ...prev,
                        [it.productId]: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              );
            })}
            <Button type="button" disabled={pending} onClick={submit}>
              {pending ? "Posting…" : "Receive into stock"}
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">GRN</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No goods receipts yet.
                </td>
              </tr>
            ) : (
              receipts.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-medium">{r.receiptNumber}</td>
                  <td className="p-3">{r.supplierName}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{Number(r.total).toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{r.receivedAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
