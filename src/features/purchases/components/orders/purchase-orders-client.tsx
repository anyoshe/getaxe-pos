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

export type ProductUnitOpt = {
  unitId: string;
  label: string;
  factorToStock: number;
  isPurchaseDefault: boolean;
  isStockUnit: boolean;
  allowPurchase: boolean;
};

export type ProductOpt = {
  id: string;
  name: string;
  sku?: string | null;
  /** Cost per stock unit (canonical) when known */
  costPerStockUnit: number;
  stockUnitLabel: string;
  units: ProductUnitOpt[];
};

type SupplierOpt = { id: string; name: string };

type Line = {
  key: string;
  productId: string;
  unitId: string | null;
  /** Qty in the selected order unit */
  quantity: number;
  /** Cost for one of the selected order unit */
  costPerOrderUnit: number;
};

function defaultUnit(product: ProductOpt | undefined): ProductUnitOpt | null {
  if (!product || product.units.length === 0) return null;
  // Prefer explicit purchase default, then stock unit (pieces/tabs).
  // Never force a box/strip just because factor > 1 — user chooses pack size.
  return (
    product.units.find((u) => u.isPurchaseDefault && u.allowPurchase) ??
    product.units.find((u) => u.isStockUnit) ??
    product.units.find((u) => u.allowPurchase) ??
    product.units[0]
  );
}

function factorFor(product: ProductOpt | undefined, unitId: string | null): number {
  if (!product || !unitId) return 1;
  const u = product.units.find((x) => x.unitId === unitId);
  return u?.factorToStock && u.factorToStock > 0 ? u.factorToStock : 1;
}

function unitLabel(product: ProductOpt | undefined, unitId: string | null): string {
  if (!product) return "unit";
  if (!unitId) return product.stockUnitLabel || "stock unit";
  return product.units.find((u) => u.unitId === unitId)?.label ?? product.stockUnitLabel;
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

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
  const [query, setQuery] = useState("");

  const firstProduct = products[0];
  const firstUnit = defaultUnit(firstProduct);

  const [lines, setLines] = useState<Line[]>(() => [
    {
      key: crypto.randomUUID(),
      productId: firstProduct?.id ?? "",
      unitId: firstUnit?.unitId ?? null,
      quantity: 1,
      costPerOrderUnit: firstProduct
        ? firstProduct.costPerStockUnit * (firstUnit?.factorToStock ?? 1)
        : 0,
    },
  ]);

  const productById = useMemo(() => {
    const m = new Map<string, ProductOpt>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

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

  const orderSubtotal = useMemo(() => {
    return lines.reduce((s, l) => s + l.quantity * l.costPerOrderUnit, 0);
  }, [lines]);

  function setLine(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function onProductChange(key: string, productId: string) {
    const p = productById.get(productId);
    const u = defaultUnit(p);
    setLine(key, {
      productId,
      unitId: u?.unitId ?? null,
      costPerOrderUnit: p
        ? p.costPerStockUnit * (u?.factorToStock ?? 1)
        : 0,
    });
  }

  function onUnitChange(key: string, unitId: string) {
    const line = lines.find((l) => l.key === key);
    const p = line ? productById.get(line.productId) : undefined;
    const factor = factorFor(p, unitId);
    // Keep cost per stock stable when switching unit if we can derive it
    const prevFactor = factorFor(p, line?.unitId ?? null);
    const costPerStock =
      prevFactor > 0 ? (line?.costPerOrderUnit ?? 0) / prevFactor : p?.costPerStockUnit ?? 0;
    setLine(key, {
      unitId,
      costPerOrderUnit: costPerStock * factor,
    });
  }

  function addLine() {
    const p = products[0];
    const u = defaultUnit(p);
    const key = crypto.randomUUID();
    setLines((prev) => [
      ...prev,
      {
        key,
        productId: p?.id ?? "",
        unitId: u?.unitId ?? null,
        quantity: 1,
        costPerOrderUnit: p ? p.costPerStockUnit * (u?.factorToStock ?? 1) : 0,
      },
    ]);
    // Scroll to the new line after paint so "Add product" stays at the bottom of lines
    requestAnimationFrame(() => {
      const el = document.getElementById(`po-line-${key}`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.key !== key)));
  }

  function submit() {
    const payload = lines
      .filter((l) => l.productId && l.quantity > 0)
      .map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.costPerOrderUnit,
        unitId: l.unitId,
      }));

    if (payload.length === 0) {
      toast.error("Add at least one line with quantity.");
      return;
    }
    if (!supplierId) {
      toast.error("Select a supplier.");
      return;
    }

    startTransition(async () => {
      const result = await createPurchaseOrderAction({
        supplierId,
        notes: notes || null,
        items: payload,
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
            Order in pieces, strips, or boxes. Stock is always stored in pieces;
            packs only multiply qty × pieces-per-pack.
          </p>
        </div>
        <Button type="button" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Close form" : "New purchase order"}
        </Button>
      </div>

      {showCreate && (
        <div className="space-y-5 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Supplier <span className="text-destructive">*</span>
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select supplier…</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery date, terms…"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-base">Order lines</Label>
              <p className="text-xs text-muted-foreground">
                Qty = how many of the selected unit. Cost = what you pay the supplier
                for <strong>one</strong> of that unit (e.g. 2,000 per box if a box
                has 50 tabs at 40 each). Use &quot;Add product&quot; under the last
                line.
              </p>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const product = productById.get(line.productId);
                const factor = factorFor(product, line.unitId);
                const stockQty = line.quantity * factor;
                const costPerStock =
                  factor > 0 ? line.costPerOrderUnit / factor : line.costPerOrderUnit;
                const lineTotal = line.quantity * line.costPerOrderUnit;
                const orderUnitName = unitLabel(product, line.unitId);
                const stockUnitName = product?.stockUnitLabel ?? "stock unit";
                // All packaging units on the product (box, strip, carton, piece…)
                const purchaseUnits = product?.units ?? [];

                return (
                  <div
                    id={`po-line-${line.key}`}
                    key={line.key}
                    className="space-y-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Line {idx + 1}
                      </span>
                      {lines.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive"
                          onClick={() => removeLine(line.key)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-12">
                      <div className="space-y-1 lg:col-span-4">
                        <Label>
                          Product <span className="text-destructive">*</span>
                        </Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                          value={line.productId}
                          onChange={(e) => onProductChange(line.key, e.target.value)}
                        >
                          <option value="">Select product…</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                              {p.sku ? ` (${p.sku})` : ""}
                            </option>
                          ))}
                        </select>
                        {product && (
                          <p className="text-xs text-muted-foreground">
                            Stock unit: <strong>{stockUnitName}</strong>
                            {product.costPerStockUnit > 0 && (
                              <>
                                {" "}
                                · ref. cost {money(product.costPerStockUnit)} /{" "}
                                {stockUnitName}
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <Label>
                          Order unit <span className="text-destructive">*</span>
                        </Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                          value={line.unitId ?? ""}
                          onChange={(e) => onUnitChange(line.key, e.target.value)}
                          disabled={!product || purchaseUnits.length === 0}
                        >
                          {purchaseUnits.length === 0 && (
                            <option value="">
                              {product ? stockUnitName : "—"}
                            </option>
                          )}
                          {purchaseUnits.map((u) => (
                            <option key={u.unitId} value={u.unitId}>
                              {u.label}
                              {u.isStockUnit
                                ? " (stock / pieces)"
                                : u.factorToStock !== 1
                                  ? ` (= ${u.factorToStock} ${stockUnitName})`
                                  : ""}
                              {u.isPurchaseDefault ? " · buy default" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <Label>
                          Qty ({orderUnitName}){" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={line.quantity}
                          onChange={(e) =>
                            setLine(line.key, {
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <Label>
                          Supplier price / 1 {orderUnitName}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.costPerOrderUnit}
                          onChange={(e) =>
                            setLine(line.key, {
                              costPerOrderUnit: Number(e.target.value),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Buying price for <strong>one {orderUnitName}</strong>
                        </p>
                      </div>

                      <div className="space-y-1 lg:col-span-2">
                        <Label>Line total</Label>
                        <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-semibold">
                          {money(lineTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium text-foreground">Into stock: </span>
                        {line.quantity} {orderUnitName}
                        {factor !== 1 ? (
                          <>
                            {" "}
                            × {factor} pcs/{orderUnitName} ={" "}
                            <strong>{money(stockQty)}</strong> {stockUnitName}
                          </>
                        ) : (
                          <>
                            {" "}
                            = <strong>{money(stockQty)}</strong> {stockUnitName}
                          </>
                        )}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Cost: </span>
                        {line.quantity} × {money(line.costPerOrderUnit)} ={" "}
                        <strong>{money(lineTotal)}</strong>
                        {" · "}
                        per {stockUnitName} ={" "}
                        <strong>{money(costPerStock)}</strong>
                        {factor > 1 ? (
                          <span className="text-muted-foreground">
                            {" "}
                            (check: {factor} × {money(costPerStock)} should ≈{" "}
                            {money(line.costPerOrderUnit)} per {orderUnitName})
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-primary/30 bg-background/80 px-3 py-3">
              <p className="text-xs text-muted-foreground">
                Line {lines.length} complete? Add another product below the list.
              </p>
              <Button type="button" size="sm" variant="outline" onClick={addLine}>
                + Add product
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/15 pt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Order subtotal </span>
              <span className="text-lg font-semibold">{money(orderSubtotal)}</span>
            </div>
            <Button
              type="button"
              disabled={pending || !supplierId || products.length === 0}
              onClick={submit}
            >
              {pending ? "Creating…" : "Create purchase order"}
            </Button>
          </div>
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
                    {(o.status === "APPROVED" ||
                      o.status === "PARTIALLY_RECEIVED") && (
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
