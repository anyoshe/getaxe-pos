"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  approvePurchaseOrderAction,
  cancelPurchaseOrderAction,
  createPurchaseOrderAction,
} from "../../actions/purchasing-ui";

export type PoRow = {
  id: string;
  orderNumber: string;
  status: string;
  total: string | number;
  supplierName: string;
  orderedAt: string;
};

type ProductOpt = { id: string; name: string; costPrice?: number | null };
type SupplierOpt = { id: string; name: string };

type Line = {
  productId: string;
  quantity: number;
  unitCost: number;
};

export function PurchaseOrdersClient({
  orders,
  suppliers,
  products,
}: {
  orders: PoRow[];
  suppliers: SupplierOpt[];
  products: ProductOpt[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { productId: products[0]?.id ?? "", quantity: 1, unitCost: 0 },
  ]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }, [orders, query]);

  function addLine() {
    setLines((prev) => [
      ...prev,
      {
        productId: products[0]?.id ?? "",
        quantity: 1,
        unitCost: Number(products[0]?.costPrice ?? 0),
      },
    ]);
  }

  function submit() {
    startTransition(async () => {
      const result = await createPurchaseOrderAction({
        supplierId,
        notes: notes || null,
        items: lines.filter((l) => l.productId && l.quantity > 0),
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setShowCreate(false);
      router.refresh();
    });
  }

  function approve(id: string) {
    startTransition(async () => {
      const result = await approvePurchaseOrderAction(id);
      if (!result.success) toast.error(result.message);
      else {
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  function cancel(id: string) {
    startTransition(async () => {
      const result = await cancelPurchaseOrderAction(id);
      if (!result.success) toast.error(result.message);
      else {
        toast.success(result.message);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase orders</h1>
          <p className="text-sm text-muted-foreground">
            Order from suppliers, approve, then receive into stock.
          </p>
        </div>
        <Button type="button" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Close" : "New purchase order"}
        </Button>
      </div>

      {showCreate && (
        <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
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
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lines</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLine}>
                Add line
              </Button>
            </div>
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-3"
              >
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={line.productId}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === idx
                          ? {
                              ...l,
                              productId: e.target.value,
                              unitCost: Number(p?.costPrice ?? l.unitCost),
                            }
                          : l,
                      ),
                    );
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={line.quantity}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === idx
                          ? { ...l, quantity: Number(e.target.value) }
                          : l,
                      ),
                    )
                  }
                  placeholder="Qty (stock units)"
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.unitCost}
                  onChange={(e) =>
                    setLines((prev) =>
                      prev.map((l, i) =>
                        i === idx
                          ? { ...l, unitCost: Number(e.target.value) }
                          : l,
                      ),
                    )
                  }
                  placeholder="Unit cost"
                />
              </div>
            ))}
          </div>

          <Button type="button" disabled={pending || !supplierId} onClick={submit}>
            {pending ? "Saving…" : "Create purchase order"}
          </Button>
        </div>
      )}

      <Input
        placeholder="Search order #, supplier, status…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No purchase orders yet.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-medium">{o.orderNumber}</td>
                  <td className="p-3">{o.supplierName}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">{Number(o.total).toLocaleString()}</td>
                  <td className="p-3 text-muted-foreground">{o.orderedAt}</td>
                  <td className="p-3 space-x-2">
                    {o.status === "DRAFT" && (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          onClick={() => approve(o.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => cancel(o.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {(o.status === "APPROVED" || o.status === "PARTIALLY_RECEIVED") && (
                      <Button type="button" size="sm" variant="secondary">
                        <a href="/purchases/receiving">Receive</a>
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
