"use client";

import {
  applyPromotion,
  type PromotionOffer,
} from "@/features/inventory/services/promotion-price";

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
  SaleReceipt,
  type ReceiptBusiness,
  type ReceiptData,
} from "./sale-receipt";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { useOffline } from "@/providers/offline-provider";
import {
  newOutboxId,
  outboxEnqueue,
  type OutboxSalePayload,
} from "@/lib/offline/outbox";
import {
  ensurePosCustomerAction,
  listPosCustomersAction,
  lookupCustomerByPhoneAction,
  previewLoyaltyEarnAction,
} from "../../actions/pos-customer";

export type PosProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
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

export type ActivePromotion = PromotionOffer;


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
  business?: ReceiptBusiness;
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
  /** Active time-bound promotions (inventory.promotional-pricing) */
  activePromotions?: ActivePromotion[];
  fullScreen?: boolean;
  cashierName?: string | null;
  recentSales?: RecentSale[];
}

export function PosClient({
  business,
  products,
  warehouses,
  branches,
  availableSerials: initialSerials,
  stockByProductWarehouse = {},
  serialsByProductWarehouse = {},
  productUnitsByProduct = {},
  pricesByProductUnit = {},
  batchesByProductWarehouse = {},
  activePromotions = [],
  fullScreen = false,
  cashierName,
  recentSales = [],
}: PosClientProps) {
  const router = useRouter();
  const { online, refreshOutbox } = useOffline();
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [catalogLayout, setCatalogLayout] = useState<"grid" | "list" | "compact">(
    "grid",
  );
  const [visibleCount, setVisibleCount] = useState(48);
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
    "CASH" | "MPESA" | "CARD" | "MOBILE_MONEY" | "CREDIT"
  >("CASH");
  /** Cash sale (immediate payment) vs credit invoice (AR / customer account). */
  const [saleMode, setSaleMode] = useState<"CASH" | "CREDIT">("CASH");
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [showCustomer, setShowCustomer] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerLabel, setCustomerLabel] = useState<string | null>(null);
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);
  const [customerContactName, setCustomerContactName] = useState<string | null>(null);
  const [posCustomers, setPosCustomers] = useState<
    Array<{
      id: string;
      displayName: string;
      contactName: string | null;
      phone: string | null;
      allowCredit: boolean;
      creditLimit: number;
      loyaltyPoints: number;
      isBusiness: boolean;
    }>
  >([]);
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
    void listPosCustomersAction().then((r) => {
      if (r.success) setPosCustomers(r.customers as any);
    });
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
      let raw = base;
      if (unitId) {
        const explicit = pricesByProductUnit[p.id]?.[unitId];
        if (explicit != null && explicit > 0) raw = explicit;
        else {
          const factor = factorToStock > 0 ? factorToStock : 1;
          raw = base * factor;
        }
      } else {
        const factor = factorToStock > 0 ? factorToStock : 1;
        raw = base * factor;
      }
      // Promotions only on retail path (not wholesale mode)
      if (priceMode === "wholesale" || activePromotions.length === 0) {
        return raw;
      }
      return applyPromotion(raw, p.id, activePromotions).price;
    },
    [priceMode, pricesByProductUnit, activePromotions],
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


  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of sellable) {
      if (p.categoryId && p.categoryName) {
        map.set(p.categoryId, p.categoryName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sellable]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = sellable;

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q),
      );
    }

    // Prefer in-stock first for quick picks
    list = [...list].sort((a, b) => {
      const sa = stockOnHand(a.id);
      const sb = stockOnHand(b.id);
      if (sa > 0 && sb <= 0) return -1;
      if (sb > 0 && sa <= 0) return 1;
      return a.name.localeCompare(b.name);
    });

    // Scan-first supermarket mode: without search/category, only surface a
    // limited "quick pick" set so 1000+ SKUs never dump onto the till.
    const browsing = Boolean(q) || categoryFilter !== "all";
    if (!browsing) {
      list = list.filter((p) => {
        if (p.productType === "service" || p.trackInventory === false) return true;
        return stockOnHand(p.id) > 0;
      });
    }

    return list;
  }, [query, sellable, categoryFilter, warehouseId, stockByProductWarehouse]);

  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(48);
  }, [query, categoryFilter]);


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
    // Prefer piece/tablet (sales default or stock unit) — never force box/strip
    return (
      list.find((u) => u.isSalesDefault && u.factorToStock <= 1) ??
      list.find((u) => u.isStockUnit) ??
      list.find((u) => u.isSalesDefault) ??
      list.find((u) => u.factorToStock <= 1) ??
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

  function searchHits(term: string, limit = 12): PosProduct[] {
    const key = term.trim().toLowerCase();
    if (!key) return [];
    const exact =
      productByCode.get(key) ??
      sellable.find(
        (p) =>
          p.barcode?.toLowerCase() === key ||
          (p.sku?.toLowerCase() === key),
      );
    if (exact) return [exact];

    const scored = sellable
      .map((p) => {
        const name = p.name.toLowerCase();
        const sku = p.sku?.toLowerCase() ?? "";
        const bc = p.barcode?.toLowerCase() ?? "";
        let score = 0;
        if (name === key || sku === key || bc === key) score = 100;
        else if (name.startsWith(key) || sku.startsWith(key)) score = 80;
        else if (name.includes(key) || sku.includes(key) || bc.includes(key))
          score = 50;
        else return null;
        return { p, score };
      })
      .filter(Boolean) as { p: PosProduct; score: number }[];

    scored.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
    return scored.slice(0, limit).map((x) => x.p);
  }

  function resolveCode(code: string) {
    const key = code.trim();
    if (!key) return;
    const hits = searchHits(key, 8);
    if (hits.length === 0) {
      toast.error(`No product matches “${code.trim()}”`);
      return;
    }
    // Exact barcode/SKU or single hit → add immediately
    const lower = key.toLowerCase();
    const exact = hits.find(
      (p) =>
        p.barcode?.toLowerCase() === lower ||
        p.sku?.toLowerCase() === lower ||
        p.name.toLowerCase() === lower,
    );
    if (exact || hits.length === 1) {
      addProduct(exact ?? hits[0]);
      setQuery("");
      scanRef.current?.focus();
      return;
    }
    // Multiple name matches — keep query so dropdown shows; toast guides
    toast.message(`${hits.length} matches — tap one below to add`);
  }

  function onScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      resolveCode(query);
    }
    if (e.key === "Escape") {
      setQuery("");
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
        setCustomerContactName(
          (result.customer as { contactName?: string | null }).contactName ?? null,
        );
        setCustomerName(
          (result.customer as { contactName?: string | null }).contactName ||
            result.customer.displayName,
        );
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

      // Credit invoice must be on a registered customer account (AR)
      if (saleMode === "CREDIT") {
        if (!customerId) {
          toast.error(
            "Credit invoice requires a customer account. Look up the customer by phone or register them first.",
          );
          return;
        }
      }

      let resolvedCustomerId = customerId;
      let receiptNote: string | null = null;
      const isOffline =
        typeof navigator !== "undefined" && !navigator.onLine;

      // Optional: link or create customer when phone was entered (online only)
      if (customerPhone.trim().length >= 7) {
        if (isOffline) {
          receiptNote = customerName.trim()
            ? `Customer: ${customerName.trim()} (${customerPhone.trim()})`
            : `Customer phone: ${customerPhone.trim()}`;
        } else {
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
          setCustomerContactName((ensured as any).contactName ?? null);
          if (ensured.created) {
            void listPosCustomersAction().then((r) => {
              if (r.success) setPosCustomers(r.customers as any);
            });
          }
          receiptNote = `Customer: ${ensured.displayName} (${ensured.phone})`;
        }
      } else if (customerName.trim()) {
        // Name only on receipt — no CRM record without phone
        receiptNote = `Walk-in: ${customerName.trim()}`;
      }

      const effectiveMethod = saleMode === "CREDIT" ? "CREDIT" : paymentMethod;
      const salePayload: OutboxSalePayload = {
        warehouseId,
        branchId,
        customerId: resolvedCustomerId,
        notes:
          saleMode === "CREDIT"
            ? `Credit invoice${receiptNote ? ` · ${receiptNote}` : ""}`
            : receiptNote
              ? `Cash sale · ${receiptNote}`
              : "Cash sale",
        paymentMethod: effectiveMethod,
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitId: l.unitId,
          preferredBatchIds: l.selectedBatchId ? [l.selectedBatchId] : [],
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? l.selectedSerials : [],
        })),
        pendingCustomer:
          !resolvedCustomerId && customerPhone.trim().length >= 7
            ? {
                phone: customerPhone.trim(),
                firstName: customerName.trim() || null,
              }
            : null,
        totalHint: total,
      };

      // Offline or network failure → queue, never drop the sale
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await outboxEnqueue({
          id: newOutboxId(),
          type: "create_sale",
          createdAt: new Date().toISOString(),
          payload: salePayload,
          attempts: 0,
        });
        await refreshOutbox();
        toast.success("Sale saved offline — will sync when online");
        setCart([]);
        setAmountTendered("");
        scanRef.current?.focus();
        return;
      }

      let result: { success: boolean; message: string };
      try {
        result = await createSaleAction({
          warehouseId: salePayload.warehouseId,
          branchId: salePayload.branchId,
          customerId: salePayload.customerId,
          notes: salePayload.notes,
          paymentMethod: salePayload.paymentMethod,
          items: salePayload.items,
        });
      } catch (e) {
        await outboxEnqueue({
          id: newOutboxId(),
          type: "create_sale",
          createdAt: new Date().toISOString(),
          payload: salePayload,
          attempts: 0,
          lastError: e instanceof Error ? e.message : String(e),
        });
        await refreshOutbox();
        toast.success("Network issue — sale queued offline for sync");
        setCart([]);
        setAmountTendered("");
        scanRef.current?.focus();
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Build printable receipt from cart + server response
      const res = result as {
        invoiceNumber?: string;
        total?: number;
        subtotal?: number;
        amountPaid?: number;
        balanceDue?: number;
        paymentMethod?: string;
        isCredit?: boolean;
        soldAt?: string;
        notes?: string | null;
      };
      const tenderedNum = Number(amountTendered);
      const saleTotal = Number(res.total ?? total);
      const paidNum = Number(
        res.isCredit || saleMode === "CREDIT"
          ? res.amountPaid ?? 0
          : saleTotal,
      );
      const changeNum =
        !res.isCredit &&
        saleMode !== "CREDIT" &&
        Number.isFinite(tenderedNum) &&
        tenderedNum > 0
          ? Math.max(0, tenderedNum - saleTotal)
          : 0;
      setLastReceipt({
        invoiceNumber: res.invoiceNumber ?? "—",
        soldAt: res.soldAt ?? new Date().toLocaleString("en-KE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Africa/Nairobi",
        }),
        cashierName: cashierName ?? null,
        customerName:
          (res as { customerDisplayName?: string }).customerDisplayName ||
          customerLabel ||
          customerName.trim() ||
          null,
        contactName:
          (res as { customerContactName?: string | null }).customerContactName ||
          customerContactName ||
          null,
        customerPhone:
          (res as { customerPhone?: string | null }).customerPhone ||
          customerPhone.trim() ||
          null,
        paymentMethod: res.paymentMethod ?? effectiveMethod,
        isCredit: Boolean(res.isCredit ?? saleMode === "CREDIT"),
        amountPaid: paidNum,
        balanceDue: Number(res.balanceDue ?? 0),
        amountTendered:
          Number.isFinite(tenderedNum) && tenderedNum > 0
            ? tenderedNum
            : paidNum,
        changeDue: changeNum,
        subtotal: Number(res.subtotal ?? total),
        total: saleTotal,
        notes: salePayload.notes,
        lines: cart.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitLabel: l.unitLabel ?? null,
          unitPrice: l.unitPrice,
          total: l.quantity * l.unitPrice,
        })),
      });

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
    ? "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background"
    : "flex h-[min(100dvh,56rem)] max-h-[100dvh] flex-col overflow-hidden rounded-2xl border shadow-sm";

  const changeDue =
    paymentMethod === "CASH" && amountTendered
      ? Math.max(0, Number(amountTendered) - total)
      : null;

  const browsing =
    Boolean(query.trim()) || categoryFilter !== "all";
  const hasMore = visibleProducts.length < filtered.length;
  const searchSuggestions =
    query.trim().length >= 1 ? searchHits(query, 15) : [];


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

      <header className="brand-gradient relative z-10 shrink-0 text-primary-foreground shadow-md">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card/20 text-xs font-black backdrop-blur sm:h-10 sm:w-10 sm:text-sm">
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
            <div className="flex rounded-full bg-black/20 p-0.5 text-[11px] font-semibold">
              {(["retail", "wholesale"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPriceMode(m)}
                  className={
                    priceMode === m
                      ? "rounded-full bg-[oklch(0.70_0.14_85)] px-2.5 py-1.5 text-[oklch(0.25_0.05_55)] shadow-sm"
                      : "rounded-full px-2.5 py-1.5 text-white/85"
                  }
                >
                  {m === "retail" ? "Retail" : "Wholesale"}
                </button>
              ))}
            </div>
            <select
              className="h-9 max-w-[9rem] flex-1 rounded-lg border-0 bg-card/15 px-2 text-xs text-white outline-none sm:flex-none"
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
            <ConnectionStatus />
            <ThemeToggle className="rounded-lg bg-card/15 text-white hover:bg-card/25 hover:text-white" />
            {fullScreen ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-card/15 px-3 py-2 text-xs font-medium hover:bg-card/25"
              >
                Exit
              </Link>
            ) : (
              <Link
                href="/sales/pos"
                className="rounded-lg bg-[oklch(0.70_0.14_85)]/90 px-3 py-2 text-xs font-semibold text-[oklch(0.25_0.05_55)]"
              >
                Full screen
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Body: on mobile products scroll; cart is a bottom sheet that also scrolls */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* CATALOGUE */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-secondary/70 to-background">
          <div className="z-10 shrink-0 space-y-2 border-b border-border/50 bg-background/95 p-2.5 backdrop-blur sm:p-3">
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Input
                    ref={scanRef}
                    autoFocus
                    className="h-12 rounded-xl border-primary/25 bg-card pr-11 text-base shadow-sm sm:h-12"
                    placeholder="Type name, SKU or scan barcode…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onScanKeyDown}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-primary hover:bg-primary/10"
                    onClick={() => setShowCamera((v) => !v)}
                  >
                    <ScanBarcode className="h-5 w-5" />
                  </button>
                </div>
                <Button
                  type="button"
                  className="h-12 shrink-0 rounded-xl bg-chart-2 px-4 font-semibold text-accent-foreground hover:bg-chart-2/90"
                  onClick={() => resolveCode(query)}
                >
                  Add
                </Button>
              </div>

              {/* Live name / SKU search results — primary mobile path */}
              {searchSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[min(50dvh,22rem)] overflow-y-auto rounded-xl border border-primary/25 bg-card shadow-xl">
                  {searchSuggestions.map((p) => {
                    const price =
                      priceMode === "wholesale"
                        ? p.wholesalePrice
                        : p.retailPrice;
                    const onHand = stockOnHand(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className="flex w-full items-center gap-2 border-b border-border/50 px-3 py-3 text-left last:border-0 hover:bg-primary/10 active:bg-primary/15"
                        onClick={() => {
                          addProduct(p);
                          setQuery("");
                          scanRef.current?.focus();
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {p.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] text-muted-foreground">
                            {[p.sku, p.barcode, p.categoryName]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                          {Number(price).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {p.trackInventory !== false &&
                        p.productType !== "service" ? (
                          <span
                            className={
                              onHand <= 0
                                ? "shrink-0 rounded-full bg-destructive/15 px-1.5 text-[10px] font-semibold text-destructive"
                                : "shrink-0 rounded-full bg-chart-4/20 px-1.5 text-[10px] font-semibold text-chart-4"
                            }
                          >
                            {onHand}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                  <p className="bg-muted/50 px-3 py-1.5 text-[10px] text-muted-foreground">
                    Tap a row to add · Enter adds exact / single match
                  </p>
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border bg-card px-3 py-3 text-sm text-muted-foreground shadow-xl">
                  No products match “{query.trim()}”
                </div>
              ) : null}
            </div>

            {showCamera && (
              <div className="rounded-xl border border-chart-3/30 bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-chart-3">Camera</p>
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

            {/* Categories + layout (supermarket aisles) */}
            <div className="flex items-center gap-2">
              <div className="-mx-0.5 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={
                    categoryFilter === "all"
                      ? "shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground"
                      : "shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                  }
                >
                  Quick picks
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryFilter(c.id)}
                    className={
                      categoryFilter === c.id
                        ? "shrink-0 rounded-full bg-chart-3 px-3 py-1.5 text-[11px] font-semibold text-white"
                        : "shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground"
                    }
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 rounded-lg border border-border bg-card p-0.5">
                {(
                  [
                    ["grid", "Grid"],
                    ["list", "List"],
                    ["compact", "Dense"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    onClick={() => setCatalogLayout(id)}
                    className={
                      catalogLayout === id
                        ? "rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground"
                        : "rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground"
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {!browsing ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-primary">
                    in-stock quick picks
                  </span>{" "}
                  · scan or pick a category for full catalogue ({sellable.length}{" "}
                  SKUs)
                </>
              ) : (
                <>
                  {filtered.length} match
                  {categoryFilter !== "all"
                    ? ` in ${categories.find((c) => c.id === categoryFilter)?.name ?? "category"}`
                    : ""}
                  {query.trim() ? ` for “${query.trim()}”` : ""}
                </>
              )}
            </p>
          </div>

          {/* THIS is the only product scroll region */}

          {query.trim().length >= 1 ? (
            <div className="flex min-h-0 flex-1 items-start justify-center p-4 text-center text-xs text-muted-foreground lg:hidden">
              <p>Results appear under the search box — tap a product to add it.</p>
            </div>
          ) : null}

          <div
            className={
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 sm:p-3 " +
              (query.trim().length >= 1 ? "max-lg:hidden" : "")
            }
          >
            {visibleProducts.length === 0 ? (
              <div className="flex min-h-[8rem] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-6 text-center">
                <ShoppingCart className="mb-2 h-8 w-8 text-primary/40" />
                <p className="text-sm font-medium text-foreground">
                  {browsing ? "No products match" : "No in-stock quick picks"}
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  {browsing
                    ? "Try another search or category."
                    : "Scan a barcode or choose a category aisle above."}
                </p>
              </div>
            ) : catalogLayout === "list" || catalogLayout === "compact" ? (
              <div className="space-y-1">
                {visibleProducts.map((p) => {
                  const price =
                    priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
                  const onHand = stockOnHand(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProduct(p)}
                      className={
                        catalogLayout === "compact"
                          ? "flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left hover:border-primary/30 hover:bg-primary/5"
                          : "flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-left shadow-sm hover:border-primary/40"
                      }
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {p.name}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-muted-foreground">
                          {[p.sku, p.barcode, p.categoryName]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                        {Number(price).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      {p.trackInventory !== false &&
                      p.productType !== "service" ? (
                        <span
                          className={
                            onHand <= 0
                              ? "shrink-0 rounded-full bg-destructive/15 px-1.5 text-[10px] font-semibold text-destructive"
                              : "shrink-0 rounded-full bg-chart-4/20 px-1.5 text-[10px] font-semibold text-chart-4"
                          }
                        >
                          {onHand}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                {visibleProducts.map((p) => {
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
                      <span className="line-clamp-2 min-h-[2.25rem] text-xs font-semibold leading-snug sm:text-sm">
                        {p.name}
                      </span>
                      <span className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                        {p.sku || p.barcode || p.categoryName || "—"}
                      </span>
                      <div className="mt-auto flex items-end justify-between gap-1 pt-2">
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

            {hasMore ? (
              <div className="flex justify-center py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-primary/30"
                  onClick={() => setVisibleCount((n) => n + 48)}
                >
                  Show more ({filtered.length - visibleProducts.length} left)
                </Button>
              </div>
            ) : null}
          </div>
        </section>


        {/* CART + PAY — sticky Complete sale always visible on mobile */}
        <section className={
          "flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-border/60 bg-card lg:max-h-none lg:h-full lg:w-[min(100%,24rem)] lg:border-t-0 xl:w-[26rem] " +
          (cart.length === 0
            ? "max-h-[7.5rem] lg:max-h-none"
            : "max-h-[42dvh] lg:max-h-none")
        }>
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-secondary/60 px-3 py-2">
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
                className="text-xs font-semibold text-destructive"
                onClick={() => setCart([])}
              >
                Clear
              </button>
            ) : null}
          </div>

          {/* Scrollable: lines + payment options + customer */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 sm:p-3">
            {cart.length === 0 ? (
              <div className="flex min-h-[3rem] items-center justify-center rounded-xl border border-dashed border-chart-2/40 bg-chart-2/10 p-3 text-center text-xs text-muted-foreground">
                Scan or tap products to start
              </div>
            ) : (
              cart.map((line) => {
                const options = freeSerials(line.productId);
                const units = productUnitsByProduct[line.productId] ?? [];
                const lineTotal = line.quantity * line.unitPrice;
                return (
                  <div
                    key={line.productId}
                    className="rounded-xl border border-border/70 bg-background p-2.5 shadow-sm"
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
                          className="flex h-8 w-8 items-center justify-center text-primary"
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
                          className="h-8 w-12 border-x border-primary/15 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
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
                          className="flex h-8 w-8 items-center justify-center text-primary"
                          onClick={() =>
                            setCart((c) =>
                              c.map((x) =>
                                x.productId === line.productId
                                  ? { ...x, quantity: x.quantity + 1 }
                                  : x,
                              ),
                            )
                          }
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {units.length > 0 ? (
                        <select
                          className="h-8 min-w-[7.5rem] rounded-lg border bg-background px-2 text-[11px]"
                          value={line.unitId ?? ""}
                          onChange={(e) => {
                            const unitId = e.target.value;
                            if (unitId) setLineUnit(line.productId, unitId);
                          }}
                          title="Sell as piece, strip, or box"
                        >
                          {units.map((u) => (
                            <option key={u.unitId} value={u.unitId}>
                              {u.label}
                              {u.factorToStock > 1
                                ? ` (×${u.factorToStock})`
                                : u.isStockUnit
                                  ? " (pc)"
                                  : ""}
                            </option>
                          ))}
                        </select>
                      ) : null}
                      <div className="ml-auto text-sm font-bold tabular-nums text-primary">
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
                      <div className="mt-2 max-h-16 space-y-1 overflow-y-auto rounded-lg border border-chart-5/30 bg-chart-5/10 p-2">
                        <p className="text-[10px] font-semibold text-chart-5">
                          Serials {line.selectedSerials.length}/
                          {Math.round(
                            line.quantity * (line.factorToStock || 1),
                          )}
                        </p>
                        {options.map((serial) => (
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
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {payMethods.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={
                      "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 " +
                      (active ? m.activeClass : m.idleClass)
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {saleMode === "CASH" && paymentMethod === "CASH" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Tendered
                  </Label>
                  <Input
                    className="h-9 rounded-xl border-chart-4/30"
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
                  <div className="flex h-9 items-center rounded-xl border border-chart-4/30 bg-chart-4/15 px-3 text-sm font-bold tabular-nums text-chart-4">
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

            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <UserRound className="h-3.5 w-3.5" />
                Customer
                <span className="font-normal text-muted-foreground">
                  · optional
                </span>
              </div>
              <select
                className="h-9 w-full rounded-xl border border-input bg-background px-2 text-sm text-foreground"
                value={customerId ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) {
                    setCustomerId(null);
                    setCustomerLabel(null);
                    setCustomerContactName(null);
                    setCustomerPoints(null);
                    return;
                  }
                  const c = posCustomers.find((x) => x.id === id);
                  if (!c) return;
                  if (saleMode === "CREDIT" && !c.allowCredit) {
                    toast.error("This customer is not enabled for credit.");
                    return;
                  }
                  setCustomerId(c.id);
                  setCustomerLabel(c.displayName);
                  setCustomerContactName(c.contactName);
                  setCustomerPhone(c.phone ?? "");
                  setCustomerPoints(c.loyaltyPoints);
                }}
              >
                <option value="">
                  {saleMode === "CREDIT"
                    ? "Select credit customer…"
                    : "Select customer (optional)…"}
                </option>
                {(saleMode === "CREDIT"
                  ? posCustomers.filter((c) => c.allowCredit)
                  : posCustomers
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.displayName}
                    {c.phone ? ` · ${c.phone}` : ""}
                    {c.allowCredit ? " · credit" : ""}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  className="h-9 rounded-xl"
                  inputMode="tel"
                  placeholder="Phone (loyalty / new customer)"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    setCustomerId(null);
                    setCustomerLabel(null);
                    setCustomerContactName(null);
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
                  className="h-9 rounded-xl"
                  placeholder="Name (receipt)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-xl border-primary/30 text-xs"
                  disabled={lookingUp || !customerPhone.trim()}
                  onClick={() => void lookupCustomer()}
                >
                  {lookingUp ? "…" : "Find member"}
                </Button>
                {(customerId || customerPhone || customerName) && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-xl text-xs"
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
          </div>

          {/* Always visible on mobile — total + complete */}
          <div className="shrink-0 space-y-2 border-t border-border/60 bg-card p-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:p-3">
            <div className="flex items-end justify-between">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-2xl font-black tabular-nums text-primary">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {/* Cash sale vs credit invoice */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSaleMode("CASH");
                  if (paymentMethod === "CREDIT") setPaymentMethod("CASH");
                }}
                className={
                  saleMode === "CASH"
                    ? "rounded-xl border-2 border-primary bg-primary/10 px-2 py-2 text-xs font-bold text-primary"
                    : "rounded-xl border border-border bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground"
                }
              >
                Cash sale
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaleMode("CREDIT");
                  setPaymentMethod("CREDIT");
                }}
                className={
                  saleMode === "CREDIT"
                    ? "rounded-xl border-2 border-primary bg-primary/10 px-2 py-2 text-xs font-bold text-primary"
                    : "rounded-xl border border-border bg-muted/40 px-2 py-2 text-xs font-medium text-muted-foreground"
                }
              >
                Credit invoice
              </button>
            </div>
            {saleMode === "CREDIT" ? (
              <p className="text-[11px] text-muted-foreground">
                Posts to Accounts Receivable. Customer account required — look
                up or register the buyer above before completing.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Immediate payment (cash, M-Pesa, card). Optional customer for
                loyalty.
              </p>
            )}
            <Button
              className="h-12 w-full rounded-xl text-base font-bold shadow-md"
              size="lg"
              disabled={
                pending ||
                cart.length === 0 ||
                (saleMode === "CREDIT" && !customerId)
              }
              onClick={checkout}
            >
              {pending
                ? "Processing…"
                : saleMode === "CREDIT"
                  ? "Post credit invoice"
                  : "Complete cash sale"}
            </Button>
          </div>
        </section>

      </div>

      {lastReceipt ? (
        <SaleReceipt
          open={!!lastReceipt}
          business={
            business ?? {
              name: "GetAxe POS",
              currency: "KES",
            }
          }
          receipt={lastReceipt}
          onClose={() => setLastReceipt(null)}
          autoPrint
        />
      ) : null}
    </div>
  );
}
