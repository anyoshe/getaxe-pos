"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { receivePurchaseOrderAction } from "../../actions/purchasing-ui";

export type ProductUnitOpt = {
  unitId: string;
  label: string;
  factorToStock: number;
  isStockUnit: boolean;
  isPurchaseDefault: boolean;
};

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
    /** Cost per stock unit (as stored on PO) */
    unitCost: number;
    stockUnitLabel: string;
    units: ProductUnitOpt[];
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

type LineState = {
  unitId: string | null;
  quantity: number;
  /** Cost for one of the selected receive unit */
  costPerOrderUnit: number;
};

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

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
  const [lineState, setLineState] = useState<Record<string, LineState>>({});

  const selected = receivable.find((p) => p.id === poId);

  function stateFor(item: ReceivePo["items"][0]): LineState {
    const existing = lineState[item.productId];
    if (existing) return existing;
    const remaining = Math.max(0, item.quantity - item.receivedQuantity);
    const u =
      item.units.find((x) => x.isPurchaseDefault) ??
      item.units.find((x) => x.isStockUnit) ??
      item.units[0];
    const factor = u?.factorToStock || 1;
    return {
      unitId: u?.unitId ?? null,
      // Default remaining in stock units expressed in selected unit
      quantity: factor > 0 ? remaining / factor : remaining,
      costPerOrderUnit: item.unitCost * factor,
    };
  }

  function patchLine(productId: string, base: ReceivePo["items"][0], patch: Partial<LineState>) {
    const cur = stateFor(base);
    setLineState((prev) => ({
      ...prev,
      [productId]: { ...cur, ...patch },
    }));
  }

  function submit() {
    if (!selected || !warehouseId) {
      toast.error("Select a purchase order and warehouse.");
      return;
    }
    const items = selected.items
      .map((it) => {
        const st = stateFor(it);
        return {
          productId: it.productId,
          quantity: st.quantity,
          unitId: st.unitId,
          unitCost: st.costPerOrderUnit,
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
          Receive in any packaging unit configured on the product (box, strip, piece…).
          Stock is always stored in the product stock unit.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Purchase order</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={poId}
              onChange={(e) => {
                setPoId(e.target.value);
                setLineState({});
              }}
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
          <div className="space-y-3">
            <Label>Lines to receive</Label>
            {selected.items.map((it) => {
              const remainingStock = Math.max(0, it.quantity - it.receivedQuantity);
              const st = stateFor(it);
              const u = it.units.find((x) => x.unitId === st.unitId);
              const factor = u?.factorToStock || 1;
              const stockQty = st.quantity * factor;
              const unitName = u?.label ?? it.stockUnitLabel;

              return (
                <div
                  key={it.productId}
                  className="space-y-2 rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    Ordered {it.quantity} {it.stockUnitLabel} · already received{" "}
                    {it.receivedQuantity} · remaining {remainingStock}{" "}
                    {it.stockUnitLabel}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Receive unit</Label>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={st.unitId ?? ""}
                        onChange={(e) => {
                          const next = it.units.find((x) => x.unitId === e.target.value);
                          const f = next?.factorToStock || 1;
                          patchLine(it.productId, it, {
                            unitId: e.target.value,
                            costPerOrderUnit: it.unitCost * f,
                            quantity: f > 0 ? remainingStock / f : remainingStock,
                          });
                        }}
                      >
                        {it.units.length === 0 && (
                          <option value="">{it.stockUnitLabel}</option>
                        )}
                        {it.units.map((unit) => (
                          <option key={unit.unitId} value={unit.unitId}>
                            {unit.label}
                            {unit.factorToStock !== 1
                              ? ` (= ${unit.factorToStock} ${it.stockUnitLabel})`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qty ({unitName})</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={st.quantity}
                        onChange={(e) =>
                          patchLine(it.productId, it, {
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost / {unitName}</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={st.costPerOrderUnit}
                        onChange={(e) =>
                          patchLine(it.productId, it, {
                            costPerOrderUnit: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    → Posts <strong>{money(stockQty)}</strong> {it.stockUnitLabel} at{" "}
                    <strong>{money(factor > 0 ? st.costPerOrderUnit / factor : st.costPerOrderUnit)}</strong>{" "}
                    / {it.stockUnitLabel}
                  </div>
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
