"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScanBarcode, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarcodeScanner } from "@/features/inventory/components/products/entry/barcode-scanner";

import { createSaleAction } from "../../actions/create-sale";
import {
  ensurePosCustomerAction,
  lookupCustomerByPhoneAction,
} from "../../actions/pos-customer";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  productType: string;
  trackInventory: boolean;
  serialized: boolean;
  trackBatch?: boolean;
  trackExpiry?: boolean;
  unitPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  active: boolean;
};

/** productId → warehouseId → qty from inventory_balances (same as Stock on Hand) */
export type StockByProductWarehouse = Record<string, Record<string, number>>;
export type SerialsByProductWarehouse = Record<string, Record<string, string[]>>;
export type PosBatchOption = {
  batchId: string;
  batchNumber: string;
  expiryDate: string | null;
  manufactureDate: string | null;
  quantity: number;
};

type WarehouseOption = { id: string; name: string; branchId: string };
type BranchOption = { id: string; name: string };
type SerialsByProduct = Record<string, string[]>;
type PriceMode = "retail" | "wholesale";

export type PosProductUnit = {
  unitId: string;
  factorToStock: number;
  isSalesDefault: boolean;
  isStockUnit: boolean;
  label: string;
};

type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unitId: string | null;
  unitLabel: string;
  factorToStock: number;
  serialized: boolean;
  selectedSerials: string[];
  selectedBatchId: string | null;
  trackBatch: boolean;
  trackExpiry: boolean;
};

type RecentSale = {
  id: string;
  invoiceNumber: string;
  total: number;
  soldAt: string;
};

interface PosClientProps {
  products: PosProduct[];
  warehouses: WarehouseOption[];
  branches: BranchOption[];
  availableSerials: SerialsByProduct;
  stockByProductWarehouse?: StockByProductWarehouse;
  serialsByProductWarehouse?: SerialsByProductWarehouse;
  productUnitsByProduct?: Record<string, PosProductUnit[]>;
  /** Optional explicit pack prices; else retail/wholesale × factor */
  pricesByProductUnit?: Record<string, Record<string, number>>;
  batchesByProductWarehouse?: Record<string, Record<string, PosBatchOption[]>>;
  fullScreen?: boolean;
  cashierName?: string | null;
  recentSales?: RecentSale[];
}

export function PosClient({
  products,
  warehouses,
  branches,
  availableSerials: initialSerials,
  stockByProductWarehouse = {},
  serialsByProductWarehouse = {},
  productUnitsByProduct = {},
  pricesByProductUnit = {},
  batchesByProductWarehouse = {},
  fullScreen = false,
  cashierName,
  recentSales = [],
}: PosClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const scanRef = useRef<HTMLInputElement>(null);

  const sellable = useMemo(
    () => products.filter((p) => p.active !== false),
    [products],
  );

  const productByCode = useMemo(() => {
    const map = new Map<string, PosProduct>();
    for (const p of sellable) {
      if (p.barcode) map.set(p.barcode.trim().toLowerCase(), p);
      if (p.sku) map.set(p.sku.trim().toLowerCase(), p);
      map.set(p.id, p);
    }
    return map;
  }, [sellable]);

  const [query, setQuery] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("retail");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [branchId, setBranchId] = useState(
    warehouses[0]?.branchId ?? branches[0]?.id ?? "",
  );

  function stockOnHand(productId: string, whId: string = warehouseId): number {
    return Number(stockByProductWarehouse[productId]?.[whId] ?? 0);
  }

  function batchesFor(
    productId: string,
    whId: string = warehouseId,
  ): PosBatchOption[] {
    return batchesByProductWarehouse[productId]?.[whId] ?? [];
  }
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MPESA" | "CARD" | "MOBILE_MONEY"
  >("CASH");
  const [showCustomer, setShowCustomer] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerLabel, setCustomerLabel] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [serialPool, setSerialPool] =
    useState<SerialsByProduct>(initialSerials);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    scanRef.current?.focus();
  }, []);

  useEffect(() => {
    const next: SerialsByProduct = {};
    for (const [pid, byWh] of Object.entries(serialsByProductWarehouse)) {
      next[pid] = byWh[warehouseId] ?? [];
    }
    // If map empty, keep initial (backward compatible)
    if (Object.keys(serialsByProductWarehouse).length === 0) {
      setSerialPool(initialSerials);
      return;
    }
    setSerialPool(next);
    setCart((prev) =>
      prev.map((line) => ({
        ...line,
        selectedSerials: line.selectedSerials.filter((s) =>
          (next[line.productId] ?? []).includes(s),
        ),
      })),
    );
  }, [warehouseId, serialsByProductWarehouse, initialSerials]);

  /**
   * Price for one sell unit:
   * 1) explicit product_prices for that unit if set
   * 2) else piece/retail (or wholesale) × factorToStock
   */
  const priceFor = useCallback(
    (p: PosProduct, unitId?: string | null, factorToStock = 1) => {
      const base =
        priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
      if (unitId) {
        const explicit = pricesByProductUnit[p.id]?.[unitId];
        if (explicit != null && explicit > 0) return explicit;
      }
      const factor = factorToStock > 0 ? factorToStock : 1;
      return base * factor;
    },
    [priceMode, pricesByProductUnit],
  );

  // When switching retail/wholesale, update cart unit prices
  useEffect(() => {
    setCart((prev) =>
      prev.map((line) => {
        const p = sellable.find((x) => x.id === line.productId);
        if (!p) return line;
        return {
          ...line,
          unitPrice: priceFor(p, line.unitId, line.factorToStock),
        };
      }),
    );
  }, [priceMode, priceFor, sellable]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = sellable;
    if (q) {
      list = sellable.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.toLowerCase().includes(q)),
      );
    }
    // Prefer products with stock in the selected warehouse (inventory_balances)
    list = [...list].sort((a, b) => {
      const sa = stockOnHand(a.id);
      const sb = stockOnHand(b.id);
      if (sa > 0 && sb <= 0) return -1;
      if (sb > 0 && sa <= 0) return 1;
      return a.name.localeCompare(b.name);
    });
    return list.slice(0, 50);
  }, [query, sellable, warehouseId, stockByProductWarehouse]);

  function freeSerials(productId: string): string[] {
    const pool =
      serialsByProductWarehouse[productId]?.[warehouseId] ??
      serialPool[productId] ??
      [];
    const takenElsewhere = new Set(
      cart
        .filter((l) => l.productId !== productId)
        .flatMap((l) => l.selectedSerials),
    );
    return pool.filter((s) => !takenElsewhere.has(s));
  }

  function defaultUnitFor(productId: string): PosProductUnit | null {
    const list = productUnitsByProduct[productId] ?? [];
    if (list.length === 0) return null;
    return (
      list.find((u) => u.isSalesDefault) ??
      list.find((u) => u.factorToStock > 1) ??
      list.find((u) => u.isStockUnit) ??
      list[0]
    );
  }

  const addProduct = useCallback(
    (p: PosProduct) => {
      const u = defaultUnitFor(p.id);
      const factor = u?.factorToStock && u.factorToStock > 0 ? u.factorToStock : 1;
      const onHand = stockOnHand(p.id);
      const isService = p.productType === "service" || !p.trackInventory;

      setCart((prev) => {
        const existing = prev.find(
          (l) => l.productId === p.id && l.unitId === (u?.unitId ?? null),
        );
        const nextQtyStock =
          ((existing?.quantity ?? 0) + 1) * factor;
        if (!isService && onHand <= 0) {
          toast.error(
            `No stock for ${p.name} in this warehouse. Check Stock on Hand or switch warehouse.`,
          );
          return prev;
        }
        if (!isService && nextQtyStock > onHand + 1e-9) {
          toast.error(
            `Only ${onHand} stock unit(s) of ${p.name} in this warehouse.`,
          );
          return prev;
        }
        if (existing) {
          return prev.map((l) =>
            l.productId === p.id && l.unitId === (u?.unitId ?? null)
              ? {
                  ...l,
                  quantity: l.quantity + 1,
                  unitPrice: priceFor(
                    p,
                    u?.unitId ?? null,
                    u?.factorToStock ?? 1,
                  ),
                }
              : l,
          );
        }
        return [
          ...prev,
          {
            productId: p.id,
            name: p.name,
            quantity: 1,
            unitPrice: priceFor(p, u?.unitId ?? null, u?.factorToStock ?? 1),
            unitId: u?.unitId ?? null,
            unitLabel: u?.label ?? "unit",
            factorToStock: u?.factorToStock ?? 1,
            serialized: p.serialized,
            trackBatch: Boolean(p.trackBatch),
            trackExpiry: Boolean(p.trackExpiry),
            selectedSerials: [],
            selectedBatchId:
              (p.trackBatch || p.trackExpiry) &&
              batchesFor(p.id)[0]?.batchId
                ? batchesFor(p.id)[0].batchId
                : null,
          },
        ];
      });
      toast.success(p.name, {
        description: u ? `Added (${u.label})` : "Added to cart",
      });
    },
    [priceFor, productUnitsByProduct],
  );

  function setLineUnit(productId: string, unitId: string) {
    const u = (productUnitsByProduct[productId] ?? []).find(
      (x) => x.unitId === unitId,
    );
    if (!u) return;
    const p = sellable.find((x) => x.id === productId);
    setCart((prev) =>
      prev.map((l) =>
        l.productId === productId
          ? {
              ...l,
              unitId: u.unitId,
              unitLabel: u.label,
              factorToStock: u.factorToStock,
              unitPrice: p
                ? priceFor(p, u.unitId, u.factorToStock)
                : l.unitPrice,
            }
          : l,
      ),
    );
  }

  function resolveCode(code: string) {
    const key = code.trim().toLowerCase();
    if (!key) return;
    const product =
      productByCode.get(key) ??
      sellable.find(
        (p) =>
          p.barcode?.toLowerCase() === key ||
          p.sku?.toLowerCase() === key,
      );
    if (!product) {
      toast.error(`No product for code: ${code}`);
      return;
    }
    addProduct(product);
    setQuery("");
    scanRef.current?.focus();
  }

  function onScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      resolveCode(query);
    }
  }

  function toggleSerial(productId: string, serial: string) {
    setCart((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line;
        const has = line.selectedSerials.includes(serial);
        if (has) {
          return {
            ...line,
            selectedSerials: line.selectedSerials.filter((s) => s !== serial),
          };
        }
        if (line.selectedSerials.length >= line.quantity) {
          toast.message(`Only ${line.quantity} serial(s) needed.`);
          return line;
        }
        return { ...line, selectedSerials: [...line.selectedSerials, serial] };
      }),
    );
  }

  async function lookupCustomer() {
    if (!customerPhone.trim()) {
      toast.message("Enter a phone number to look up.");
      return;
    }
    setLookingUp(true);
    try {
      const result = await lookupCustomerByPhoneAction(customerPhone);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      if (result.found) {
        setCustomerId(result.customer.id);
        setCustomerLabel(result.customer.displayName);
        setCustomerName(result.customer.displayName);
        setCustomerPhone(result.customer.phone ?? customerPhone);
        toast.success(`Customer found: ${result.customer.displayName}`);
      } else {
        setCustomerId(null);
        setCustomerLabel(null);
        toast.message(result.message);
      }
    } finally {
      setLookingUp(false);
    }
  }

  function clearCustomer() {
    setCustomerId(null);
    setCustomerLabel(null);
    setCustomerPhone("");
    setCustomerName("");
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  function checkout() {
    startTransition(async () => {
      if (!warehouseId || !branchId) {
        toast.error("Select warehouse.");
        return;
      }
      if (cart.length === 0) {
        toast.error("Cart is empty.");
        return;
      }
      for (const line of cart) {
        const prod = sellable.find((x) => x.id === line.productId);
        if (prod && prod.productType !== "service" && prod.trackInventory !== false) {
          const factor = line.factorToStock > 0 ? line.factorToStock : 1;
          const need = line.quantity * factor;
          const onHand = stockOnHand(line.productId);
          if (need > onHand + 1e-9) {
            toast.error(
              `${line.name}: need ${need} stock unit(s), only ${onHand} in this warehouse (matches Stock on Hand).`,
            );
            return;
          }
        }
      }
      for (const line of cart) {
        if (line.serialized) {
          const needSerials = Math.round(
            line.quantity * (line.factorToStock > 0 ? line.factorToStock : 1),
          );
          if (line.selectedSerials.length !== needSerials) {
            toast.error(
              `${line.name}: select ${needSerials} serial number(s) (stock units).`,
            );
            return;
          }
        }
      }

      let resolvedCustomerId = customerId;
      let receiptNote: string | null = null;

      // Optional: link or create customer when phone was entered
      if (customerPhone.trim().length >= 7) {
        const ensured = await ensurePosCustomerAction({
          phone: customerPhone,
          firstName: customerName.trim() || null,
        });
        if (!ensured.success) {
          toast.error(ensured.message);
          return;
        }
        resolvedCustomerId = ensured.customerId;
        setCustomerId(ensured.customerId);
        setCustomerLabel(ensured.displayName);
        receiptNote = `Customer: ${ensured.displayName} (${ensured.phone})`;
      } else if (customerName.trim()) {
        // Name only on receipt — no CRM record without phone
        receiptNote = `Walk-in: ${customerName.trim()}`;
      }

      const result = await createSaleAction({
        warehouseId,
        branchId,
        customerId: resolvedCustomerId,
        notes: receiptNote,
        paymentMethod,
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitId: l.unitId,
          preferredBatchIds: l.selectedBatchId ? [l.selectedBatchId] : [],
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? l.selectedSerials : [],
        })),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setCart([]);
      // keep phone for rapid repeat sales to same loyalty customer; clear name-only walk-in
      if (!resolvedCustomerId) {
        setCustomerName("");
      }
      setSerialPool((prev) => {
        const next = { ...prev };
        for (const line of cart) {
          if (!line.serialized) continue;
          const sold = new Set(line.selectedSerials);
          next[line.productId] = (next[line.productId] ?? []).filter(
            (s) => !sold.has(s),
          );
        }
        return next;
      });
      router.refresh();
      scanRef.current?.focus();
    });
  }

  const shell = fullScreen
    ? "fixed inset-0 z-50 flex flex-col bg-background"
    : "flex flex-col gap-4";

  return (
    <div className={shell}>
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">GetAxe POS</span>
          {cashierName ? (
            <span className="hidden text-sm opacity-90 sm:inline">
              · {cashierName}
            </span>
          ) : null}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-primary-foreground/15 p-0.5 text-sm">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                priceMode === "retail"
                  ? "bg-primary-foreground text-primary shadow-sm"
                  : "opacity-90 hover:opacity-100"
              }`}
              onClick={() => setPriceMode("retail")}
            >
              Retail
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                priceMode === "wholesale"
                  ? "bg-primary-foreground text-primary shadow-sm"
                  : "opacity-90 hover:opacity-100"
              }`}
              onClick={() => setPriceMode("wholesale")}
            >
              Wholesale
            </button>
          </div>

          <select
            className="h-9 rounded-md border-0 bg-primary-foreground/15 px-2 text-sm text-primary-foreground"
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              const w = warehouses.find((x) => x.id === e.target.value);
              if (w?.branchId) setBranchId(w.branchId);
            }}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id} className="text-foreground">
                {w.name}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border-0 bg-primary-foreground/15 px-2 text-sm text-primary-foreground"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as typeof paymentMethod)
            }
          >
            <option value="CASH" className="text-foreground">
              Cash
            </option>
            <option value="MPESA" className="text-foreground">
              M-Pesa
            </option>
            <option value="CARD" className="text-foreground">
              Card
            </option>
            <option value="MOBILE_MONEY" className="text-foreground">
              Mobile money
            </option>
          </select>

          {fullScreen ? (
            <Link
              href="/inventory/stock"
              className="rounded-md bg-primary-foreground/15 px-3 py-1.5 text-sm hover:bg-primary-foreground/25"
            >
              Exit
            </Link>
          ) : (
            <Link
              href="/sales/pos"
              className="rounded-md bg-primary-foreground/15 px-3 py-1.5 text-sm hover:bg-primary-foreground/25"
            >
              Full screen
            </Link>
          )}
        </div>
      </header>

      {/* Optional customer — lookup by phone (loyalty) or capture for receipt */}
      <div className="border-b border-border/50 bg-card/50 px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
            onClick={() => setShowCustomer((v) => !v)}
          >
            {showCustomer ? "Hide customer" : "Customer (optional)"}
          </button>
          {customerLabel ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {customerLabel}
              {customerPhone ? ` · ${customerPhone}` : ""}
              <button
                type="button"
                className="ml-1 opacity-70 hover:opacity-100"
                onClick={clearCustomer}
              >
                ×
              </button>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Walk-in · phone lookup for rewards · capture name for receipt
            </span>
          )}
        </div>
        {showCustomer && (
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Input
              className="h-9"
              placeholder="Phone (lookup / rewards)"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setCustomerId(null);
                setCustomerLabel(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void lookupCustomer();
                }
              }}
            />
            <Input
              className="h-9"
              placeholder="Name (receipt — optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9"
              disabled={lookingUp}
              onClick={() => void lookupCustomer()}
            >
              {lookingUp ? "…" : "Lookup"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={clearCustomer}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        {/* Products / scan */}
        <section className="flex min-h-0 flex-col border-r border-border/50 p-3 sm:p-4">
          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={scanRef}
                autoFocus
                className="h-12 pr-12 text-base"
                placeholder="Scan barcode / QR or type SKU, then Enter…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onScanKeyDown}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Camera scan"
                onClick={() => setShowCamera((v) => !v)}
              >
                <ScanBarcode className="h-5 w-5" />
              </button>
            </div>
            <Button
              type="button"
              className="h-12 px-5"
              onClick={() => resolveCode(query)}
            >
              Add
            </Button>
          </div>

          {showCamera && (
            <div className="mb-3 rounded-xl border border-primary/20 bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Camera scanner</p>
                <button type="button" onClick={() => setShowCamera(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <BarcodeScanner
                continuous
                onScan={(code) => {
                  resolveCode(code);
                }}
                onClose={() => setShowCamera(false)}
              />
            </div>
          )}

          <p className="mb-2 text-xs text-muted-foreground">
            Showing {priceMode} prices · tap product or scan to add
          </p>

          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-xl border bg-card/40 p-2">
            {filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                No products match.
              </p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-primary/8"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {[p.sku, p.barcode].filter(Boolean).join(" · ") || "—"}
                      {p.serialized ? " · serial" : ""}
                      {p.productType !== "service" && p.trackInventory !== false
                        ? ` · stock ${stockOnHand(p.id)}`
                        : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block tabular-nums font-semibold text-primary">
                      {(() => {
                        const u = defaultUnitFor(p.id);
                        return priceFor(
                          p,
                          u?.unitId ?? null,
                          u?.factorToStock ?? 1,
                        ).toFixed(2);
                      })()}
                    </span>
                    {p.productType !== "service" && p.trackInventory !== false && (
                      <span
                        className={
                          stockOnHand(p.id) > 0
                            ? "text-[10px] text-muted-foreground"
                            : "text-[10px] text-destructive"
                        }
                      >
                        {stockOnHand(p.id) > 0
                          ? `${stockOnHand(p.id)} on hand`
                          : "Out of stock"}
                      </span>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Cart */}
        <section className="flex min-h-0 flex-col bg-muted/30 p-3 sm:p-4">
          <h2 className="mb-2 text-lg font-semibold">Cart</h2>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Scan or search to start a sale
              </p>
            ) : (
              cart.map((line) => {
                const options = freeSerials(line.productId);
                return (
                  <div
                    key={`${line.productId}-${line.unitId ?? "stock"}`}
                    className="space-y-2 rounded-xl border bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{line.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{line.unitPrice.toFixed(2)}</strong> per{" "}
                          {line.unitLabel || "unit"}
                          {line.factorToStock !== 1
                            ? ` (${(line.unitPrice / line.factorToStock).toFixed(2)} per stock unit)`
                            : ""}{" "}
                          · {priceMode}
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
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Sell unit</Label>
                        {(productUnitsByProduct[line.productId]?.length ?? 0) >=
                        1 ? (
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            value={line.unitId ?? ""}
                            onChange={(e) =>
                              setLineUnit(line.productId, e.target.value)
                            }
                          >
                            {(productUnitsByProduct[line.productId] ?? []).map(
                              (u) => (
                                <option key={u.unitId} value={u.unitId}>
                                  {u.label}
                                  {u.factorToStock !== 1
                                    ? ` (= ${u.factorToStock} stock)`
                                    : " (stock unit)"}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <div className="flex h-9 items-center rounded-md border bg-muted/40 px-2 text-sm">
                            {line.unitLabel || "unit"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Qty ({line.unitLabel || "unit"})
                        </Label>
                        <Input
                          className="h-9 w-24"
                          type="number"
                          min={0.000001}
                          step="any"
                          value={line.quantity}
                          onChange={(e) => {
                            const q = Math.max(
                              0,
                              Number(e.target.value) || 0,
                            );
                            const factor =
                              line.factorToStock > 0 ? line.factorToStock : 1;
                            const stockNeed = q * factor;
                            setCart((c) =>
                              c.map((x) =>
                                x.productId === line.productId
                                  ? {
                                      ...x,
                                      quantity: q,
                                      // Serials still count in stock units
                                      selectedSerials: x.selectedSerials.slice(
                                        0,
                                        Math.round(stockNeed) || 0,
                                      ),
                                    }
                                  : x,
                              ),
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1 text-right">
                        <Label className="text-xs">Line total</Label>
                        <div className="flex h-9 items-center justify-end text-base font-semibold tabular-nums">
                          {(line.quantity * line.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    {line.factorToStock !== 1 && (
                      <p className="text-xs text-muted-foreground">
                        {line.quantity} {line.unitLabel} × {line.factorToStock} ={" "}
                        <strong>
                          {(line.quantity * line.factorToStock).toLocaleString()}
                        </strong>{" "}
                        stock units deducted from inventory
                      </p>
                    )}

                    {(line.trackBatch || line.trackExpiry) &&
                      batchesFor(line.productId).length > 0 && (
                        <div className="space-y-1 rounded-lg border border-primary/20 bg-primary/5 p-2">
                          <Label className="text-xs">
                            Batch / lot{" "}
                            <span className="text-muted-foreground">
                              (FEFO — earliest expiry first)
                            </span>
                          </Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                            value={line.selectedBatchId ?? ""}
                            onChange={(e) => {
                              const id = e.target.value || null;
                              setCart((c) =>
                                c.map((x) =>
                                  x.productId === line.productId &&
                                  x.unitId === line.unitId
                                    ? { ...x, selectedBatchId: id }
                                    : x,
                                ),
                              );
                            }}
                          >
                            <option value="">Auto FEFO (earliest expiry)</option>
                            {batchesFor(line.productId).map((b) => (
                              <option key={b.batchId} value={b.batchId}>
                                {b.batchNumber}
                                {b.expiryDate ? ` · exp ${b.expiryDate}` : ""}
                                {b.manufactureDate
                                  ? ` · mfg ${b.manufactureDate}`
                                  : ""}
                                {` · ${b.quantity} avail`}
                              </option>
                            ))}
                          </select>
                          {line.selectedBatchId && (
                            <p className="text-[11px] text-muted-foreground">
                              Selling from selected lot first; remainder uses next
                              expiry (FEFO).
                            </p>
                          )}
                        </div>
                      )}
                    {line.serialized && (
                      <div className="space-y-1">
                        <Label className="text-xs">
                          Serials ({line.selectedSerials.length}/
                          {Math.round(line.quantity * (line.factorToStock || 1))})
                        </Label>
                        {options.length === 0 ? (
                          <p className="text-xs text-destructive">
                            No available serials
                          </p>
                        ) : (
                          <div className="max-h-28 space-y-1 overflow-y-auto rounded-md border border-primary/20 bg-primary/5 p-2">
                            {options.map((serial) => (
                              <label
                                key={serial}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={line.selectedSerials.includes(
                                    serial,
                                  )}
                                  onChange={() =>
                                    toggleSerial(line.productId, serial)
                                  }
                                />
                                <span className="font-mono text-xs">
                                  {serial}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 space-y-3 border-t pt-3">
            <div className="flex items-end justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-3xl font-bold tabular-nums text-primary">
                {total.toFixed(2)}
              </span>
            </div>
            <Button
              className="h-14 w-full text-base font-semibold"
              size="lg"
              disabled={pending || cart.length === 0}
              onClick={checkout}
            >
              {pending ? "Processing…" : "Complete sale"}
            </Button>
          </div>

          {recentSales.length > 0 && (
            <div className="mt-3 max-h-28 overflow-y-auto text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Recent</p>
              {recentSales.map((s) => (
                <div key={s.id} className="flex justify-between py-0.5">
                  <span>{s.invoiceNumber}</span>
                  <span className="tabular-nums">{s.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
