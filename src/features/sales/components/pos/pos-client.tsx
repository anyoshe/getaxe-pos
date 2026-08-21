"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createSaleAction } from "../../actions/create-sale";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  productType: string;
  trackInventory: boolean;
  serialized: boolean;
  unitPrice: number;
  active: boolean;
};

type WarehouseOption = { id: string; name: string; branchId: string };
type BranchOption = { id: string; name: string };

type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  serialized: boolean;
  serialsText: string;
};

interface PosClientProps {
  products: PosProduct[];
  warehouses: WarehouseOption[];
  branches: BranchOption[];
}

function parseSerials(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PosClient({ products, warehouses, branches }: PosClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const sellable = useMemo(
    () => products.filter((p) => p.active !== false && p.productType !== "service" || p.productType === "service"),
    [products],
  );

  const [query, setQuery] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [branchId, setBranchId] = useState(
    warehouses[0]?.branchId ?? branches[0]?.id ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MPESA" | "CARD" | "MOBILE_MONEY"
  >("CASH");
  const [cart, setCart] = useState<CartLine[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sellable.slice(0, 40);
    return sellable
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)),
      )
      .slice(0, 40);
  }, [query, sellable]);

  function addProduct(p: PosProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing && !p.serialized) {
        return prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      if (existing && p.serialized) {
        return prev.map((l) =>
          l.productId === p.id
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          quantity: 1,
          unitPrice: p.unitPrice,
          serialized: p.serialized,
          serialsText: "",
        },
      ];
    });
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  function checkout() {
    startTransition(async () => {
      if (!warehouseId || !branchId) {
        toast.error("Select branch and warehouse.");
        return;
      }
      if (cart.length === 0) {
        toast.error("Add at least one product.");
        return;
      }

      const result = await createSaleAction({
        warehouseId,
        branchId,
        paymentMethod,
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? parseSerials(l.serialsText) : [],
        })),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setCart([]);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sales
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">POS</h1>
          <p className="text-sm text-muted-foreground">
            Add products, capture serials when required, take payment, and stock
            is deducted automatically.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Warehouse</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                const w = warehouses.find((x) => x.id === e.target.value);
                if (w?.branchId) setBranchId(w.branchId);
              }}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as typeof paymentMethod)
              }
            >
              <option value="CASH">Cash</option>
              <option value="MPESA">M-Pesa</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_MONEY">Mobile money</option>
            </select>
          </div>
        </div>

        <Input
          placeholder="Search name, SKU, or barcode…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="max-h-[28rem] space-y-1 overflow-y-auto rounded-xl border p-2">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No products match.
            </p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addProduct(p)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/5"
              >
                <span>
                  <span className="font-medium">{p.name}</span>
                  {p.sku ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.sku}
                    </span>
                  ) : null}
                  {p.serialized ? (
                    <span className="ml-2 rounded-full bg-primary/10 px-1.5 text-[10px] text-primary">
                      serial
                    </span>
                  ) : null}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {p.unitPrice.toFixed(2)}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
        <h2 className="font-semibold">Cart</h2>

        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tap products on the left to add them.
          </p>
        ) : (
          <ul className="space-y-3">
            {cart.map((line) => (
              <li
                key={line.productId}
                className="space-y-2 rounded-lg border border-border/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{line.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @ {line.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-destructive"
                    onClick={() =>
                      setCart((c) =>
                        c.filter((x) => x.productId !== line.productId),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Qty</Label>
                  <Input
                    className="h-8 w-20"
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => {
                      const q = Math.max(1, Number(e.target.value) || 1);
                      setCart((c) =>
                        c.map((x) =>
                          x.productId === line.productId
                            ? { ...x, quantity: q }
                            : x,
                        ),
                      );
                    }}
                  />
                  <span className="ml-auto tabular-nums text-sm font-medium">
                    {(line.quantity * line.unitPrice).toFixed(2)}
                  </span>
                </div>
                {line.serialized && (
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Serial numbers * ({parseSerials(line.serialsText).length}/
                      {line.quantity})
                    </Label>
                    <Textarea
                      rows={Math.min(4, line.quantity)}
                      value={line.serialsText}
                      onChange={(e) =>
                        setCart((c) =>
                          c.map((x) =>
                            x.productId === line.productId
                              ? { ...x, serialsText: e.target.value }
                              : x,
                          ),
                        )
                      }
                      placeholder="One serial per line"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-medium">Total</span>
          <span className="text-xl font-semibold tabular-nums">
            {total.toFixed(2)}
          </span>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={pending || cart.length === 0}
          onClick={checkout}
        >
          {pending ? "Processing…" : "Complete sale"}
        </Button>
      </section>
    </div>
  );
}
