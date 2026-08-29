"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ScanBarcode,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarcodeScanner } from "@/features/inventory/components/products/entry/barcode-scanner";

import { createSaleAction } from "../../actions/create-sale";
import {
  ensurePosCustomerAction,
  lookupCustomerByPhoneAction,
  previewLoyaltyEarnAction,
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
  const [amountTendered, setAmountTendered] = useState("");
  const [showCustomer, setShowCustomer] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerLabel, setCustomerLabel] = useState<string | null>(null);
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [earnPreview, setEarnPreview] = useState<number | null>(null);
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
        setCustomerPoints(result.customer.loyaltyPoints ?? 0);
        toast.success(
          `Member: ${result.customer.displayName} · ${result.customer.loyaltyPoints ?? 0} pts`,
        );
      } else {
        setCustomerId(null);
        setCustomerLabel(null);
        setCustomerPoints(null);
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
    setCustomerPoints(null);
    setEarnPreview(null);
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  // Client-side estimate: 1 pt per 100 (server program may differ; refreshed on lookup)
  const estimatedEarn =
    customerId && total > 0 ? Math.floor(total / 100) : 0;


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

      if (resolvedCustomerId) {
        const preview = await previewLoyaltyEarnAction(total).catch(() => null);
        const pts = preview?.success ? preview.points : estimatedEarn;
        toast.success(
          pts > 0
            ? `${result.message} · ~${pts} loyalty point(s) awarded`
            : result.message,
        );
      } else {
        toast.success(result.message);
      }
      setCart([]);
      setAmountTendered("");
      // Keep member phone for next sale (supermarket style); clear if walk-in only
      if (!resolvedCustomerId) {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerPoints(null);
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
    : "flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border shadow-sm";

  const changeDue =
    paymentMethod === "CASH" && amountTendered
      ? Math.max(0, Number(amountTendered) - total)
      : null;

  const payMethods: {
    id: typeof paymentMethod;
    label: string;
    icon: typeof Banknote;
  }[] = [
    { id: "CASH", label: "Cash", icon: Banknote },
    { id: "MPESA", label: "M-Pesa", icon: Smartphone },
    { id: "CARD", label: "Card", icon: CreditCard },
    { id: "MOBILE_MONEY", label: "Mobile", icon: Smartphone },
  ];

  return (
    <div className={shell}>
      {/* Brand top bar */}
      <header className="brand-gradient relative shrink-0 text-primary-foreground shadow-md">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-sm font-black tracking-tight backdrop-blur">
              GA
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold tracking-tight">GetAxe POS</div>
              <div className="truncate text-xs text-white/75">
                {cashierName ? `Cashier · ${cashierName}` : "Point of sale"}
                {branchId
                  ? ` · ${branches.find((b) => b.id === branchId)?.name ?? ""}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-black/20 p-0.5 text-xs font-medium">
              {(["retail", "wholesale"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPriceMode(m)}
                  className={
                    priceMode === m
                      ? "rounded-full bg-white px-3 py-1.5 text-primary shadow-sm"
                      : "rounded-full px-3 py-1.5 text-white/80 hover:text-white"
                  }
                >
                  {m === "retail" ? "Retail" : "Wholesale"}
                </button>
              ))}
            </div>

            <select
              className="h-9 max-w-[10rem] rounded-lg border-0 bg-white/15 px-2 text-xs text-white outline-none backdrop-blur"
              value={warehouseId}
              onChange={(e) => {
                const id = e.target.value;
                setWarehouseId(id);
                const wh = warehouses.find((w) => w.id === id);
                if (wh?.branchId) setBranchId(wh.branchId);
              }}
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id} className="text-foreground">
                  {w.name}
                </option>
              ))}
            </select>

            {fullScreen ? (
              <Link
                href="/sales"
                className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium hover:bg-white/25"
              >
                Exit
              </Link>
            ) : (
              <Link
                href="/sales/pos"
                className="rounded-lg bg-white/15 px-3 py-2 text-xs font-medium hover:bg-white/25"
              >
                Full screen
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        {/* LEFT — catalogue */}
        <section className="flex min-h-0 flex-col border-r border-border/60 bg-muted/20">
          <div className="shrink-0 space-y-3 border-b border-border/50 bg-background/80 p-3 backdrop-blur sm:p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={scanRef}
                  autoFocus
                  className="h-14 rounded-xl border-primary/25 bg-background pr-12 text-base shadow-sm focus-visible:ring-primary/30"
                  placeholder="Scan barcode or type name / SKU…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onScanKeyDown}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary hover:bg-primary/10"
                  title="Camera scan"
                  onClick={() => setShowCamera((v) => !v)}
                >
                  <ScanBarcode className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="button"
                className="h-14 rounded-xl px-6 text-base font-semibold shadow-sm"
                onClick={() => resolveCode(query)}
              >
                Add
              </Button>
            </div>

            {showCamera && (
              <div className="rounded-xl border border-primary/20 bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium">Camera scanner</p>
                  <button type="button" onClick={() => setShowCamera(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <BarcodeScanner
                  continuous
                  onScan={(code) => resolveCode(code)}
                  onClose={() => setShowCamera(false)}
                />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">
                {priceMode === "retail" ? "Retail" : "Wholesale"}
              </span>{" "}
              prices · {filtered.length} products · tap or scan to add
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {filtered.length === 0 ? (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                <ShoppingCart className="mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No products match</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => {
                  const price =
                    priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
                  const onHand = stockOnHand(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="group flex flex-col rounded-2xl border border-border/80 bg-card p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md active:scale-[0.98]"
                    >
                      <span className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                        {p.name}
                      </span>
                      <span className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                        {p.sku || p.barcode || "—"}
                      </span>
                      <div className="mt-auto flex items-end justify-between gap-1 pt-3">
                        <span className="text-base font-bold tabular-nums text-primary">
                          {Number(price).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {p.trackInventory !== false &&
                        p.productType !== "service" ? (
                          <span
                            className={
                              onHand <= 0
                                ? "rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive"
                                : "rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary"
                            }
                          >
                            {onHand}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            svc
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT — cart + pay */}
        <section className="flex min-h-0 flex-col bg-background">
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Current sale</div>
                <div className="text-[11px] text-muted-foreground">
                  {cart.length} line{cart.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            {cart.length > 0 ? (
              <button
                type="button"
                className="text-xs font-medium text-destructive hover:underline"
                onClick={() => setCart([])}
              >
                Clear cart
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {cart.length === 0 ? (
              <div className="flex h-full min-h-[10rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Cart is empty — scan or tap a product
                </p>
              </div>
            ) : (
              cart.map((line) => {
                const options = freeSerials(line.productId);
                const units = productUnitsByProduct[line.productId] ?? [];
                const lineTotal = line.quantity * line.unitPrice;
                return (
                  <div
                    key={line.productId}
                    className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold leading-tight">
                          {line.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {line.unitPrice.toLocaleString()} / {line.unitLabel}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setCart((c) =>
                            c.filter((x) => x.productId !== line.productId),
                          )
                        }
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-xl border bg-background">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center text-primary hover:bg-primary/10"
                          onClick={() => {
                            const q = Math.max(0, line.quantity - 1);
                            const factor =
                              line.factorToStock > 0 ? line.factorToStock : 1;
                            setCart((c) =>
                              c
                                .map((x) =>
                                  x.productId === line.productId
                                    ? {
                                        ...x,
                                        quantity: q,
                                        selectedSerials: x.selectedSerials.slice(
                                          0,
                                          Math.round(q * factor) || 0,
                                        ),
                                      }
                                    : x,
                                )
                                .filter((x) => x.quantity > 0),
                            );
                          }}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          className="h-9 w-14 border-x bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
                          type="number"
                          min={0.000001}
                          step="any"
                          value={line.quantity}
                          onChange={(e) => {
                            const q = Math.max(0, Number(e.target.value) || 0);
                            const factor =
                              line.factorToStock > 0 ? line.factorToStock : 1;
                            setCart((c) =>
                              c.map((x) =>
                                x.productId === line.productId
                                  ? {
                                      ...x,
                                      quantity: q,
                                      selectedSerials: x.selectedSerials.slice(
                                        0,
                                        Math.round(q * factor) || 0,
                                      ),
                                    }
                                  : x,
                              ),
                            );
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center text-primary hover:bg-primary/10"
                          onClick={() => {
                            const q = line.quantity + 1;
                            setCart((c) =>
                              c.map((x) =>
                                x.productId === line.productId
                                  ? { ...x, quantity: q }
                                  : x,
                              ),
                            );
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {units.length > 1 ? (
                        <select
                          className="h-9 rounded-xl border bg-background px-2 text-xs"
                          value={line.unitId ?? ""}
                          onChange={(e) => {
                            const unitId = e.target.value;
                            if (unitId) setLineUnit(line.productId, unitId);
                          }}
                        >
                          {units.map((u) => (
                            <option key={u.unitId} value={u.unitId}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      ) : null}

                      <div className="ml-auto text-base font-bold tabular-nums text-foreground">
                        {lineTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {(line.trackBatch || line.trackExpiry) &&
                      batchesFor(line.productId).length > 0 && (
                        <div className="mt-2">
                          <select
                            className="h-8 w-full rounded-lg border border-primary/20 bg-primary/5 px-2 text-[11px]"
                            value={line.selectedBatchId ?? ""}
                            onChange={(e) =>
                              setCart((c) =>
                                c.map((x) =>
                                  x.productId === line.productId
                                    ? {
                                        ...x,
                                        selectedBatchId: e.target.value || null,
                                      }
                                    : x,
                                ),
                              )
                            }
                          >
                            <option value="">Batch · FEFO default</option>
                            {batchesFor(line.productId).map((b) => (
                              <option key={b.batchId} value={b.batchId}>
                                {b.batchNumber}
                                {b.expiryDate ? ` · exp ${b.expiryDate}` : ""}
                                {` · ${b.quantity}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                    {line.serialized && (
                      <div className="mt-2 max-h-24 space-y-1 overflow-y-auto rounded-lg border border-primary/20 bg-primary/5 p-2">
                        <p className="text-[10px] font-medium text-primary">
                          Serials {line.selectedSerials.length}/
                          {Math.round(
                            line.quantity * (line.factorToStock || 1),
                          )}
                        </p>
                        {options.length === 0 ? (
                          <p className="text-[11px] text-destructive">
                            No available serials
                          </p>
                        ) : (
                          options.map((serial) => (
                            <label
                              key={serial}
                              className="flex cursor-pointer items-center gap-2 text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={line.selectedSerials.includes(serial)}
                                onChange={() =>
                                  toggleSerial(line.productId, serial)
                                }
                              />
                              <span className="font-mono">{serial}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout dock */}
          <div className="shrink-0 space-y-3 border-t border-border/60 bg-card p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] sm:p-4">
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-black tabular-nums tracking-tight text-primary">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {payMethods.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={
                      active
                        ? "flex flex-col items-center gap-1 rounded-xl bg-primary px-1 py-2.5 text-primary-foreground shadow-sm"
                        : "flex flex-col items-center gap-1 rounded-xl border border-border bg-background px-1 py-2.5 text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "CASH" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Amount tendered
                  </Label>
                  <Input
                    className="h-10 rounded-xl"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={total.toFixed(2)}
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Change
                  </Label>
                  <div className="flex h-10 items-center rounded-xl border bg-primary/5 px-3 text-sm font-bold tabular-nums text-primary">
                    {changeDue != null
                      ? changeDue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Member phone */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <UserRound className="h-3.5 w-3.5" />
                Member phone
                <span className="font-normal text-muted-foreground">
                  · optional
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  className="h-10 flex-1 rounded-xl"
                  inputMode="tel"
                  placeholder="07… for loyalty points"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setCustomerId(null);
                    setCustomerLabel(null);
                    setCustomerPoints(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void lookupCustomer();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl"
                  disabled={lookingUp || !customerPhone.trim()}
                  onClick={() => void lookupCustomer()}
                >
                  {lookingUp ? "…" : "Find"}
                </Button>
              </div>
              {customerId && customerLabel ? (
                <div className="flex items-center justify-between text-xs">
                  <span>
                    <span className="font-medium text-primary">
                      {customerLabel}
                    </span>
                    {customerPoints != null ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {customerPoints} pts
                        {estimatedEarn > 0
                          ? ` · +~${estimatedEarn}`
                          : ""}
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={clearCustomer}
                  >
                    Clear
                  </button>
                </div>
              ) : null}
            </div>

            <Button
              className="h-14 w-full rounded-xl text-base font-bold shadow-md"
              size="lg"
              disabled={pending || cart.length === 0}
              onClick={checkout}
            >
              {pending ? "Processing…" : "Complete sale"}
            </Button>

            {recentSales.length > 0 ? (
              <div className="max-h-16 overflow-y-auto text-[11px] text-muted-foreground">
                {recentSales.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex justify-between py-0.5">
                    <span>{s.invoiceNumber}</span>
                    <span className="tabular-nums">{s.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
