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
    : "flex min-h-[min(100dvh,56rem)] flex-col overflow-hidden rounded-2xl border shadow-sm";

  const changeDue =
    paymentMethod === "CASH" && amountTendered
      ? Math.max(0, Number(amountTendered) - total)
      : null;

  const payMethods: {
    id: typeof paymentMethod;
    label: string;
    icon: typeof Banknote;
    activeClass: string;
    idleClass: string;
  }[] = [
    {
      id: "CASH",
      label: "Cash",
      icon: Banknote,
      activeClass: "bg-chart-4 text-white shadow-md ring-2 ring-chart-4/40",
      idleClass:
        "border border-chart-4/30 bg-chart-4/10 text-chart-4 hover:bg-chart-4/20",
    },
    {
      id: "MPESA",
      label: "M-Pesa",
      icon: Smartphone,
      activeClass: "bg-chart-2 text-accent-foreground shadow-md ring-2 ring-chart-2/40",
      idleClass:
        "border border-chart-2/40 bg-chart-2/15 text-accent-foreground hover:bg-chart-2/25",
    },
    {
      id: "CARD",
      label: "Card",
      icon: CreditCard,
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40",
      idleClass:
        "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
    },
    {
      id: "MOBILE_MONEY",
      label: "Mobile",
      icon: Smartphone,
      activeClass: "bg-chart-3 text-white shadow-md ring-2 ring-chart-3/40",
      idleClass:
        "border border-chart-3/30 bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
    },
  ];

  return (
    <div className={shell}>
      <div className="brand-stripe h-1.5 w-full shrink-0" />

      <header className="brand-gradient relative shrink-0 text-primary-foreground shadow-md">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xs font-black backdrop-blur sm:h-10 sm:w-10 sm:text-sm">
              GA
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold tracking-tight sm:text-lg">
                GetAxe POS
              </div>
              <div className="truncate text-[10px] text-white/80 sm:text-xs">
                {cashierName ? `Cashier · ${cashierName}` : "Point of sale"}
                {branchId
                  ? ` · ${branches.find((b) => b.id === branchId)?.name ?? ""}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <div className="flex rounded-full bg-black/20 p-0.5 text-[11px] font-semibold sm:text-xs">
              {(["retail", "wholesale"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPriceMode(m)}
                  className={
                    priceMode === m
                      ? "rounded-full bg-[oklch(0.70_0.14_85)] px-2.5 py-1.5 text-[oklch(0.25_0.05_55)] shadow-sm sm:px-3"
                      : "rounded-full px-2.5 py-1.5 text-white/85 hover:text-white sm:px-3"
                  }
                >
                  {m === "retail" ? "Retail" : "Wholesale"}
                </button>
              ))}
            </div>

            <select
              className="h-9 max-w-[9rem] flex-1 rounded-lg border-0 bg-white/15 px-2 text-xs text-white outline-none backdrop-blur sm:max-w-[10rem] sm:flex-none"
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
                className="rounded-lg bg-[oklch(0.70_0.14_85)]/90 px-3 py-2 text-xs font-semibold text-[oklch(0.25_0.05_55)] hover:opacity-90"
              >
                Full screen
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile: column. Desktop: side-by-side */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Products */}
        <section className="flex min-h-0 flex-1 flex-col border-border/60 bg-gradient-to-b from-secondary/80 via-background to-background lg:border-r">
          <div className="shrink-0 space-y-2 border-b border-border/50 bg-background/90 p-2.5 backdrop-blur sm:space-y-3 sm:p-4">
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Input
                  ref={scanRef}
                  autoFocus
                  className="h-12 rounded-xl border-primary/25 bg-card pr-11 text-base shadow-sm focus-visible:ring-primary/30 sm:h-14 sm:pr-12"
                  placeholder="Scan or type name / SKU…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onScanKeyDown}
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary hover:bg-primary/10"
                  title="Camera scan"
                  onClick={() => setShowCamera((v) => !v)}
                >
                  <ScanBarcode className="h-5 w-5" />
                </button>
              </div>
              <Button
                type="button"
                className="h-12 shrink-0 rounded-xl bg-chart-2 px-4 font-semibold text-accent-foreground hover:bg-chart-2/90 sm:h-14 sm:px-6"
                onClick={() => resolveCode(query)}
              >
                Add
              </Button>
            </div>

            {showCamera && (
              <div className="rounded-xl border border-chart-3/30 bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-chart-3">Camera scanner</p>
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

            <p className="text-[11px] text-muted-foreground sm:text-xs">
              <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">
                {priceMode === "retail" ? "Retail" : "Wholesale"}
              </span>{" "}
              · {filtered.length} products
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-4">
            {filtered.length === 0 ? (
              <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-6 text-center">
                <ShoppingCart className="mb-2 h-8 w-8 text-primary/40" />
                <p className="text-sm text-muted-foreground">No products match</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => {
                  const price =
                    priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
                  const onHand = stockOnHand(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className="group flex flex-col rounded-2xl border border-border/70 bg-card p-2.5 text-left shadow-sm transition hover:border-primary/50 hover:shadow-md active:scale-[0.98] sm:p-3"
                    >
                      <span className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug sm:min-h-[2.5rem] sm:text-sm">
                        {p.name}
                      </span>
                      <span className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        {p.sku || p.barcode || "—"}
                      </span>
                      <div className="mt-auto flex items-end justify-between gap-1 pt-2 sm:pt-3">
                        <span className="text-sm font-bold tabular-nums text-primary sm:text-base">
                          {Number(price).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {p.trackInventory !== false &&
                        p.productType !== "service" ? (
                          <span
                            className={
                              onHand <= 0
                                ? "rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive"
                                : "rounded-full bg-chart-4/20 px-1.5 py-0.5 text-[10px] font-semibold text-chart-4"
                            }
                          >
                            {onHand}
                          </span>
                        ) : (
                          <span className="rounded-full bg-chart-3/15 px-1.5 py-0.5 text-[10px] font-medium text-chart-3">
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

        {/* Cart + pay — full width on mobile, sidebar on desktop */}
        <section className="flex max-h-[52dvh] min-h-0 w-full shrink-0 flex-col border-t border-border/60 bg-card shadow-[0_-6px_24px_rgba(15,40,80,0.08)] lg:max-h-none lg:w-[min(100%,24rem)] lg:shrink-0 lg:border-t-0 lg:shadow-none xl:w-[26rem]">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-secondary/60 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Sale</div>
                <div className="text-[11px] text-muted-foreground">
                  {cart.length} item{cart.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            {cart.length > 0 ? (
              <button
                type="button"
                className="text-xs font-semibold text-destructive hover:underline"
                onClick={() => setCart([])}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-2 sm:p-3">
            {cart.length === 0 ? (
              <div className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border border-dashed border-chart-2/40 bg-chart-2/10 p-4 text-center lg:min-h-[8rem]">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Scan or tap products to start
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
                    className="rounded-xl border border-border/70 bg-background p-2.5 shadow-sm sm:rounded-2xl sm:p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-xl border border-primary/20 bg-primary/5">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center text-primary sm:h-9 sm:w-9"
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
                          className="h-8 w-12 border-x border-primary/15 bg-transparent text-center text-sm font-semibold tabular-nums outline-none sm:h-9 sm:w-14"
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
                          className="flex h-8 w-8 items-center justify-center text-primary sm:h-9 sm:w-9"
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
                          className="h-8 rounded-lg border bg-background px-2 text-[11px] sm:h-9 sm:text-xs"
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

                      <div className="ml-auto text-sm font-bold tabular-nums text-primary sm:text-base">
                        {lineTotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {(line.trackBatch || line.trackExpiry) &&
                      batchesFor(line.productId).length > 0 && (
                        <select
                          className="mt-2 h-8 w-full rounded-lg border border-chart-3/30 bg-chart-3/10 px-2 text-[11px]"
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
                          <option value="">Batch · FEFO</option>
                          {batchesFor(line.productId).map((b) => (
                            <option key={b.batchId} value={b.batchId}>
                              {b.batchNumber}
                              {b.expiryDate ? ` · exp ${b.expiryDate}` : ""}
                              {` · ${b.quantity}`}
                            </option>
                          ))}
                        </select>
                      )}

                    {line.serialized && (
                      <div className="mt-2 max-h-20 space-y-1 overflow-y-auto rounded-lg border border-chart-5/30 bg-chart-5/10 p-2">
                        <p className="text-[10px] font-semibold text-chart-5">
                          Serials {line.selectedSerials.length}/
                          {Math.round(
                            line.quantity * (line.factorToStock || 1),
                          )}
                        </p>
                        {options.length === 0 ? (
                          <p className="text-[11px] text-destructive">
                            No serials
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

          {/* Pay dock only — no recent sales */}
          <div className="shrink-0 space-y-2.5 border-t border-border/60 bg-gradient-to-t from-secondary/50 to-card p-2.5 sm:space-y-3 sm:p-4">
            <div className="flex items-end justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total
              </span>
              <span className="text-2xl font-black tabular-nums tracking-tight text-primary sm:text-3xl">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {payMethods.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={
                      "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-center transition sm:py-2.5 " +
                      (active ? m.activeClass : m.idleClass)
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold sm:text-[11px]">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === "CASH" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Tendered
                  </Label>
                  <Input
                    className="h-10 rounded-xl border-chart-4/30"
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
                  <div className="flex h-10 items-center rounded-xl border border-chart-4/30 bg-chart-4/15 px-3 text-sm font-bold tabular-nums text-chart-4">
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

            {/* Customer: phone + name for receipt / loyalty */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-2.5 sm:p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <UserRound className="h-3.5 w-3.5" />
                Customer
                <span className="font-normal text-muted-foreground">
                  · optional
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  className="h-10 rounded-xl"
                  inputMode="tel"
                  placeholder="Phone (loyalty)"
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
                <Input
                  className="h-10 rounded-xl"
                  placeholder="Name (receipt)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-primary/30"
                  disabled={lookingUp || !customerPhone.trim()}
                  onClick={() => void lookupCustomer()}
                >
                  {lookingUp ? "…" : "Find member"}
                </Button>
                {(customerId || customerPhone || customerName) && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-xl"
                    onClick={clearCustomer}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {customerId && customerLabel ? (
                <p className="text-xs">
                  <span className="font-medium text-primary">{customerLabel}</span>
                  {customerPoints != null ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {customerPoints} pts
                      {estimatedEarn > 0 ? ` · +~${estimatedEarn}` : ""}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-primary text-base font-bold shadow-md hover:bg-primary/90 sm:h-14"
              size="lg"
              disabled={pending || cart.length === 0}
              onClick={checkout}
            >
              {pending ? "Processing…" : "Complete sale"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
