"use client";

import { searchPosProductsAction } from "@/features/sales/actions/search-pos-products";

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
  Building2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarcodeScanner } from "@/features/inventory/components/products/entry/barcode-scanner";

import { createSaleAction } from "../../actions/create-sale";
import {
  getMpesaPosFlagsAction,
  initiateMpesaStkAction,
  queryMpesaStkAction,
} from "@/features/finance/actions/mpesa";
import {
  SaleReceipt,
  type ReceiptBusiness,
  type ReceiptData,
} from "./sale-receipt";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ConnectionStatus } from "@/components/layout/connection-status";
import { useOffline } from "@/providers/offline-provider";
import {
  outboxEnqueue,
  newOutboxId,
  offlineInvoiceLabel,
  savePosCatalog,
  type OutboxSalePayload,
} from "@/lib/offline/outbox";
import {
  ensurePosCustomerAction,
  listPosCustomersAction,
  lookupCustomerByPhoneAction,
  previewLoyaltyEarnAction,
} from "../../actions/pos-customer";
import { createCustomerAction } from "../../actions/create-customer";

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
  isControlled?: boolean;
  trackBatch?: boolean;
  trackExpiry?: boolean;
  unitPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  /** Book / average cost per stock unit — used to prevent selling at/below cost */
  costPrice?: number;
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
  allowSale?: boolean;
  unitCode?: string | null;
  unitName?: string | null;
};

type CartLine = {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  unitId: string | null;
  unitLabel: string;
  factorToStock: number;
  serialized: boolean;
  isControlled?: boolean;
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
  cashAccounts?: Array<{
    id: string;
    name: string;
    type: string;
    bankName?: string | null;
    accountNumber?: string | null;
    branchName?: string | null;
    active?: boolean;
  }>;
  /** off | warn | block — below book cost on a line */
  belowCostSalePolicy?: "off" | "warn" | "block";
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
  cashAccounts = [],
  belowCostSalePolicy = "block",
}: PosClientProps) {
  const router = useRouter();
  const { online, refreshOutbox } = useOffline();

  // Keep a local catalog snapshot so search still works briefly offline
  useEffect(() => {
    if (!online) return;
    void savePosCatalog({
      savedAt: new Date().toISOString(),
      products: products as unknown[],
      stockByProductWarehouse: stockByProductWarehouse as Record<
        string,
        Record<string, number>
      >,
    });
  }, [online, products, stockByProductWarehouse]);
  const [pending, startTransition] = useTransition();
  const scanRef = useRef<HTMLInputElement>(null);

  const [catalog, setCatalog] = useState(products);
  const [stockMap, setStockMap] = useState(stockByProductWarehouse);
  const [unitsMap, setUnitsMap] = useState(productUnitsByProduct);
  const [pricesMap, setPricesMap] = useState(pricesByProductUnit);
  const [batchesMap, setBatchesMap] = useState(batchesByProductWarehouse);
  const [serialsMap, setSerialsMap] = useState(serialsByProductWarehouse);
  const [searching, setSearching] = useState(false);

  const [query, setQuery] = useState("");

  useEffect(() => {
    setCatalog(products);
  }, [products]);

  useEffect(() => {
    setStockMap(stockByProductWarehouse);
  }, [stockByProductWarehouse]);

  const sellable = useMemo(
    () => catalog.filter((p) => p.active !== false),
    [catalog],
  );

  // Server search-first: load matches beyond the initial seed catalogue
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      void searchPosProductsAction({ query: q, limit: 30 }).then((r) => {
        if (cancelled || !r.success) {
          setSearching(false);
          return;
        }
        setCatalog((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          for (const raw of r.products) {
            map.set(raw.id, {
              id: raw.id,
              name: raw.name,
              sku: raw.sku,
              barcode: raw.barcode,
              categoryId: raw.categoryId,
              categoryName: raw.categoryName,
              productType: String(raw.productType ?? "physical"),
              trackInventory: raw.trackInventory,
              trackBatch: raw.trackBatch,
              trackExpiry: raw.trackExpiry,
              serialized: raw.serialized,
              isControlled: raw.isControlled,
              costPrice: raw.costPrice,
              retailPrice: Number(raw.retailPrice ?? 0),
              wholesalePrice: Number(raw.wholesalePrice ?? 0),
              unitPrice: Number(
                raw.sellingPrice ?? raw.retailPrice ?? 0
              ),
              active: raw.active !== false,
            });
          }
          return Array.from(map.values());
        });
        const s = r.support;
        setStockMap((prev) => ({ ...prev, ...s.stockByProductWarehouse }));
        setUnitsMap((prev) => {
          const next = { ...prev };
          for (const [pid, list] of Object.entries(s.productUnitsByProduct)) {
            next[pid] = list.map((u) => ({
              unitId: u.unitId,
              factorToStock: u.factorToStock,
              isSalesDefault: u.isSalesDefault,
              isStockUnit: u.isStockUnit,
              allowSale: u.allowSale,
              unitCode: u.unitCode,
              unitName: u.unitName,
              label: u.label || u.unitName || u.unitCode || "Unit",
            }));
          }
          return next;
        });
        setPricesMap((prev) => ({ ...prev, ...s.unitPricesByProduct }));
        setBatchesMap((prev) => ({ ...prev, ...s.batchesByProductWarehouse }));
        setSerialsMap((prev) => {
          const next = { ...prev };
          for (const [pid, list] of Object.entries(s.serialsByProduct)) {
            const byWh: Record<string, string[]> = { ...(next[pid] ?? {}) };
            for (const ser of list) {
              const wh = ser.warehouseId ?? "_";
              byWh[wh] = [...(byWh[wh] ?? []), ser.serialNumber];
            }
            next[pid] = byWh;
          }
          return next;
        });
        setSearching(false);
      });
    }, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);


  const productByCode = useMemo(() => {
    const map = new Map<string, PosProduct>();
    for (const p of sellable) {
      if (p.barcode) map.set(p.barcode.trim().toLowerCase(), p);
      if (p.sku) map.set(p.sku.trim().toLowerCase(), p);
      map.set(p.id, p);
    }
    return map;
  }, [sellable]);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [catalogLayout, setCatalogLayout] = useState<"grid" | "list" | "compact">(
    "grid",
  );
  /** browse = product catalogue; scan = search/scan + cart table (no product grid) */
  const [posView, setPosView] = useState<"browse" | "scan">("browse");
  const [visibleCount, setVisibleCount] = useState(48);
  const [priceMode, setPriceMode] = useState<PriceMode>("retail");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "");
  const [branchId, setBranchId] = useState(
    warehouses[0]?.branchId ?? branches[0]?.id ?? "",
  );

  function stockOnHand(productId: string, whId: string = warehouseId): number {
    return Number(stockMap[productId]?.[whId] ?? 0);
  }

  function batchesFor(
    productId: string,
    whId: string = warehouseId,
  ): PosBatchOption[] {
    const raw = batchesMap[productId]?.[whId] ?? [];
    // FEFO: earliest expiry first; no-expiry last; prefer qty remaining
    return [...raw].sort((a, b) => {
      const ea = a.expiryDate ? Date.parse(a.expiryDate) : Number.POSITIVE_INFINITY;
      const eb = b.expiryDate ? Date.parse(b.expiryDate) : Number.POSITIVE_INFINITY;
      if (ea !== eb) return ea - eb;
      return (b.quantity ?? 0) - (a.quantity ?? 0);
    });
  }

  /** Prefer earliest-expiring batch with stock; null if none. */
  function pickFefoBatchId(productId: string): string | null {
    const list = batchesFor(productId).filter((b) => (b.quantity ?? 0) > 1e-9);
    const pool = list.length > 0 ? list : batchesFor(productId);
    return pool[0]?.batchId ?? null;
  }
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MPESA" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY" | "CREDIT"
  >("CASH");
  const [mobileProvider, setMobileProvider] = useState<"MPESA" | "AIRTEL" | "OTHER">(
    "MPESA",
  );
  const [mpesaStkEnabled, setMpesaStkEnabled] = useState(false);
  const [mpesaSim, setMpesaSim] = useState(true);
  const [stkBusy, setStkBusy] = useState(false);
  const [stkStatus, setStkStatus] = useState<string | null>(null);
  const [bankChannel, setBankChannel] = useState<
    "TRANSFER" | "DEPOSIT" | "RTGS" | "EFT" | "CHEQUE"
  >("TRANSFER");
  const [paymentReference, setPaymentReference] = useState("");
  const [originBank, setOriginBank] = useState("");
  const [selectedCashAccountId, setSelectedCashAccountId] = useState("");
  /** Cash sale (immediate payment) vs credit invoice (AR / customer account). */
  const [saleMode, setSaleMode] = useState<"CASH" | "CREDIT">("CASH");
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerDialogMode, setCustomerDialogMode] = useState<"select" | "create">("select");
  const [customerSaving, setCustomerSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    idNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    creditLimit: "",
  });
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
    if (posView === "scan") {
      scanRef.current?.focus();
    }
  }, [posView]);

  useEffect(() => {
    void listPosCustomersAction().then((r) => {
      if (r.success) setPosCustomers(r.customers as any);
    });
  }, []);

  useEffect(() => {
    const next: SerialsByProduct = {};
    for (const [pid, byWh] of Object.entries(serialsMap)) {
      next[pid] = byWh[warehouseId] ?? [];
    }
    if (Object.keys(serialsMap).length === 0) {
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
  }, [warehouseId, serialsMap, initialSerials]);

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
        const explicit = pricesMap[p.id]?.[unitId];
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
    [priceMode, pricesMap, activePromotions],
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
    const list = unitsMap[productId] ?? [];
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
      const linePrice = priceFor(p, u?.unitId ?? null, factor);
      if (!isService && !(linePrice > 0)) {
        toast.error(
          `No retail selling price for ${p.name}. Set price under Product prices (or category markup + Apply), then refresh POS.`,
        );
        return;
      }

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
            sku: p.sku ?? null,
            quantity: 1,
            unitPrice: priceFor(p, u?.unitId ?? null, u?.factorToStock ?? 1),
            unitId: u?.unitId ?? null,
            unitLabel: u?.label ?? "unit",
            factorToStock: u?.factorToStock ?? 1,
            serialized: p.serialized,
            isControlled: Boolean(p.isControlled),
            trackBatch: Boolean(p.trackBatch),
            trackExpiry: Boolean(p.trackExpiry),
            selectedSerials: [],
            selectedBatchId:
              (p.trackBatch || p.trackExpiry)
                ? pickFefoBatchId(p.id)
                : null,
          },
        ];
      });
      toast.success(p.name, {
        description: u ? `Added (${u.label})` : "Added to cart",
      });
    },
    [priceFor, unitsMap],
  );

  function setLineUnit(productId: string, unitId: string) {
    const u = (unitsMap[productId] ?? []).find(
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
        if (saleMode === "CREDIT" && !result.customer.allowCredit) {
          toast.error("This customer is not enabled for credit. Choose an eligible credit customer.");
          return;
        }
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
        setPosCustomers((current) =>
          current.some((customer) => customer.id === result.customer.id)
            ? current
            : [
                {
                  id: result.customer.id,
                  displayName: result.customer.displayName,
                  contactName:
                    (result.customer as { contactName?: string | null }).contactName ?? null,
                  phone: result.customer.phone ?? null,
                  allowCredit: result.customer.allowCredit,
                  creditLimit: result.customer.creditLimit,
                  loyaltyPoints: result.customer.loyaltyPoints ?? 0,
                  isBusiness: result.customer.customerType === "BUSINESS",
                },
                ...current,
              ],
        );
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

  function openCustomerDialog(mode: "select" | "create" = "select") {
    setCustomerDialogMode(mode);
    if (mode === "create") {
      setNewCustomer((current) => ({
        ...current,
        firstName: current.firstName || customerName,
        phone: current.phone || customerPhone,
      }));
    }
    setCustomerDialogOpen(true);
  }

  async function createPosCustomer() {
    setCustomerSaving(true);
    try {
      const allowCredit = saleMode === "CREDIT";
      const result = await createCustomerAction({
        customerType: "INDIVIDUAL",
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        phone: newCustomer.phone,
        idNumber: newCustomer.idNumber,
        address: newCustomer.address,
        emergencyContact: newCustomer.emergencyContact,
        emergencyPhone: newCustomer.emergencyPhone,
        allowCredit,
        creditLimit: allowCredit ? newCustomer.creditLimit : 0,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const [lookup, refreshedCustomers] = await Promise.all([
        lookupCustomerByPhoneAction(newCustomer.phone),
        listPosCustomersAction(),
      ]);
      if (!lookup.success || !lookup.found) {
        toast.error("Customer was created, but could not be selected. Find them by phone in the customer picker.");
        if (refreshedCustomers.success) setPosCustomers(refreshedCustomers.customers as any);
        return;
      }

      if (refreshedCustomers.success) {
        setPosCustomers(refreshedCustomers.customers as any);
      }
      setCustomerId(lookup.customer.id);
      setCustomerLabel(lookup.customer.displayName);
      setCustomerContactName(lookup.customer.contactName ?? null);
      setCustomerPhone(lookup.customer.phone ?? newCustomer.phone);
      setCustomerName(lookup.customer.contactName || lookup.customer.displayName);
      setCustomerPoints(lookup.customer.loyaltyPoints ?? 0);
      setCustomerDialogOpen(false);
      if (saleMode === "CREDIT") setCheckoutOpen(true);
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create customer.");
    } finally {
      setCustomerSaving(false);
    }
  }

  const total = cart.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const missingSerialLines = cart.filter((line) => {
    if (!line.serialized) return false;
    const factor = line.factorToStock > 0 ? line.factorToStock : 1;
    const stockQuantity = line.quantity * factor;
    return (
      factor !== 1 ||
      !Number.isInteger(stockQuantity) ||
      line.selectedSerials.length !== Math.round(stockQuantity) ||
      new Set(line.selectedSerials).size !== line.selectedSerials.length
    );
  });

  // Client-side estimate: 1 pt per 100 (server program may differ; refreshed on lookup)
  const estimatedEarn =
    customerId && total > 0 ? Math.floor(total / 100) : 0;


  async function requestMpesaStk() {
    const phone =
      customerPhone.trim() ||
      (customerLabel && /\d{9,}/.test(customerLabel) ? customerLabel : "");
    if (!phone) {
      toast.error("Enter customer phone (07…) to send M-Pesa STK.");
      return;
    }
    if (total <= 0) {
      toast.error("Cart total must be greater than zero.");
      return;
    }
    setStkBusy(true);
    setStkStatus("Sending prompt…");
    try {
      const start = await initiateMpesaStkAction({
        phone,
        amount: total,
        cashAccountId: selectedCashAccountId || null,
      });
      if (!start.success) {
        toast.error(start.message);
        setStkStatus(null);
        return;
      }
      toast.message(start.message);
      setStkStatus(start.simulated ? "Simulation — confirming…" : "Waiting for PIN…");
      // Poll up to ~90s
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const q = await queryMpesaStkAction({
          requestId: start.requestId,
          checkoutRequestId: start.checkoutRequestId,
        });
        if (!q.success) continue;
        if (q.status === "SUCCESS") {
          const receipt = q.mpesaReceipt || start.checkoutRequestId;
          setPaymentReference(receipt);
          setStkStatus(`Paid · ${receipt}`);
          toast.success(`M-Pesa confirmed: ${receipt}`);
          setStkBusy(false);
          return;
        }
        if (q.status === "FAILED" || q.status === "CANCELLED") {
          setStkStatus(q.resultDesc || q.status);
          toast.error(q.resultDesc || "M-Pesa payment not completed");
          setStkBusy(false);
          return;
        }
        setStkStatus(`Waiting for PIN… (${i + 1})`);
      }
      setStkStatus("Still pending — enter code manually if paid");
      toast.message("STK still pending. If customer paid, type the M-Pesa code below.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "STK failed");
      setStkStatus(null);
    } finally {
      setStkBusy(false);
    }
  }

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
      if (missingSerialLines.length > 0) {
        toast.error(
          `Select one serial / chassis number for each unit of: ${missingSerialLines.map((line) => line.name).join(", ")}.`,
        );
        return;
      }
      if (saleMode === "CREDIT") {
        const creditCustomer = posCustomers.find((customer) => customer.id === customerId);
        if (!creditCustomer?.allowCredit) {
          setCheckoutOpen(false);
          openCustomerDialog("select");
          return;
        }
      }
      if (belowCostSalePolicy !== "off") {
        for (const line of cart) {
          const prod = sellable.find((x) => x.id === line.productId);
          if (!prod || prod.productType === "service") continue;
          const cost = Number(prod.costPrice ?? 0);
          const factor = line.factorToStock > 0 ? line.factorToStock : 1;
          const costForLineUnit = cost * factor;
          const atOrBelow =
            cost > 0 && line.unitPrice + 1e-9 <= costForLineUnit + 0.009;
          if (!atOrBelow) continue;
          const msg =
            Math.abs(line.unitPrice - costForLineUnit) < 0.009
              ? `${line.name}: price equals cost (${costForLineUnit.toFixed(2)}).`
              : `${line.name}: selling ${line.unitPrice.toFixed(2)} is below cost ${costForLineUnit.toFixed(2)}.`;
          if (belowCostSalePolicy === "block") {
            toast.error(
              `${msg} Update Product prices or set policy to Warn under Settings → Pricing policy.`,
            );
            return;
          }
          toast.warning(`${msg} Completing under warn policy.`);
        }
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
        if (
          (line.trackBatch || line.trackExpiry) &&
          batchesFor(line.productId).length > 0 &&
          !line.selectedBatchId
        ) {
          toast.error(
            `${line.name}: select a batch / expiry date before completing the sale.`,
          );
          return;
        }
      }
      for (const line of cart) {
        const prod = sellable.find((x) => x.id === line.productId) as
          | { isControlled?: boolean }
          | undefined;
        if (prod?.isControlled && !customerId && !customerPhone.trim()) {
          toast.error(
            `${line.name} is controlled — record customer name/phone or select a customer for the register.`,
          );
          return;
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

      type PayMethod =
        | "CASH"
        | "MPESA"
        | "CARD"
        | "BANK_TRANSFER"
        | "CHEQUE"
        | "MOBILE_MONEY"
        | "CREDIT";
      let effectiveMethod: PayMethod =
        saleMode === "CREDIT" ? "CREDIT" : paymentMethod;
      if (saleMode !== "CREDIT" && paymentMethod === "MPESA") {
        effectiveMethod =
          mobileProvider === "MPESA" ? "MPESA" : "MOBILE_MONEY";
      }
      if (saleMode !== "CREDIT" && paymentMethod === "BANK_TRANSFER") {
        effectiveMethod =
          bankChannel === "CHEQUE" ? "CHEQUE" : "BANK_TRANSFER";
      }
      const paymentDetailParts: string[] = [];
      if (saleMode !== "CREDIT" && paymentMethod === "MPESA") {
        paymentDetailParts.push(`Provider: ${mobileProvider}`);
      }
      if (saleMode !== "CREDIT" && paymentMethod === "BANK_TRANSFER") {
        paymentDetailParts.push(`Channel: ${bankChannel}`);
        if (originBank.trim()) paymentDetailParts.push(`From: ${originBank.trim()}`);
        const dest = bankAccounts.find((a) => a.id === selectedCashAccountId);
        if (dest) {
          paymentDetailParts.push(
            `To: ${dest.name}${dest.bankName ? ` (${dest.bankName})` : ""}${dest.accountNumber ? ` ${dest.accountNumber}` : ""}`,
          );
        }
      }
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
        cashAccountId:
          saleMode === "CREDIT"
            ? null
            : selectedCashAccountId || null,
        paymentReference: paymentReference.trim() || null,
        paymentDetail: paymentDetailParts.length
          ? paymentDetailParts.join(" · ")
          : null,
        items: cart.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitId: l.unitId,
          preferredBatchIds: l.selectedBatchId ? [l.selectedBatchId] : [],
          unitPrice: l.unitPrice,
          serialNumbers: l.serialized ? l.selectedSerials : [],
          name: l.name,
        })),
        pendingCustomer:
          !resolvedCustomerId && customerPhone.trim().length >= 7
            ? {
                phone: customerPhone.trim(),
                firstName: customerName.trim() || null,
              }
            : null,
        totalHint: total,
        clientSaleId: newOutboxId(),
      };

      // Offline or network failure → queue, never drop the sale
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await outboxEnqueue({
          id: salePayload.clientSaleId,
          type: "create_sale",
          createdAt: new Date().toISOString(),
          payload: salePayload,
          attempts: 0,
        });
        await refreshOutbox();
        toast.success("Sale saved offline — will sync when online");
        setStockMap((prev) => {
          const next = { ...prev };
          const wh = warehouseId;
          for (const l of cart) {
            const factor = l.factorToStock > 0 ? l.factorToStock : 1;
            const need = l.quantity * factor;
            const byWh = { ...(next[l.productId] ?? {}) };
            const cur = Number(byWh[wh] ?? 0);
            byWh[wh] = Math.max(0, cur - need);
            next[l.productId] = byWh;
          }
          return next;
        });
        setLastReceipt({
          invoiceNumber: offlineInvoiceLabel(salePayload.clientSaleId),
          soldAt: new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }),
          total: total,
          subtotal: total,
          amountPaid: saleMode === "CREDIT" ? 0 : total,
          balanceDue: saleMode === "CREDIT" ? total : 0,
          paymentMethod: effectiveMethod,
          isCredit: saleMode === "CREDIT",
          notes: salePayload.notes,
          lines: cart.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            total: l.quantity * l.unitPrice,
            serialNumbers: l.serialized ? l.selectedSerials : [],
          })),
          offline: true,
        } as any);
        setCart([]);
        setAmountTendered("");
        setPaymentReference("");
        setOriginBank("");
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
          cashAccountId: salePayload.cashAccountId ?? null,
          paymentReference: salePayload.paymentReference ?? null,
          paymentDetail: salePayload.paymentDetail ?? null,
          items: salePayload.items,
          clientSaleId: salePayload.clientSaleId,
        });
      } catch (e) {
        await outboxEnqueue({
          id: salePayload.clientSaleId,
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
      setCheckoutOpen(false);
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
        etims: (res as { etims?: ReceiptData["etims"] }).etims ?? null,
        lines: cart.map((l) => ({
          name: l.name,
          quantity: l.quantity,
          unitLabel: l.unitLabel ?? null,
          unitPrice: l.unitPrice,
          total: l.quantity * l.unitPrice,
          sku: l.sku ?? null,
          serialNumbers:
            l.serialized && l.selectedSerials.length > 0
              ? [...l.selectedSerials]
              : undefined,
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


  const bankAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "BANK" && !a.name.toLowerCase().includes("card"),
  );
  const mpesaAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "MPESA",
  );
  const mobileAccounts = cashAccounts.filter(
    (a) => a.active !== false && a.type === "MOBILE_MONEY",
  );
  const cardAccounts = cashAccounts.filter(
    (a) =>
      a.active !== false &&
      (a.type === "BANK" && a.name.toLowerCase().includes("card")),
  );

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
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30",
      idleClass:
        "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
    },
    {
      id: "MPESA",
      label: "M-Pesa",
      icon: Smartphone,
      activeClass: "bg-accent text-accent-foreground shadow-md ring-2 ring-accent/50",
      idleClass:
        "border border-accent/70 bg-accent/30 text-accent-foreground hover:bg-accent/50",
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
      id: "BANK_TRANSFER",
      label: "Bank",
      icon: Building2,
      activeClass: "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30",
      idleClass:
        "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
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
              {(["browse", "scan"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPosView(m)}
                  className={
                    posView === m
                      ? "rounded-full bg-card px-2.5 py-1.5 text-foreground shadow-sm"
                      : "rounded-full px-2.5 py-1.5 text-white/85"
                  }
                >
                  {m === "browse" ? "Browse" : "Scan"}
                </button>
              ))}
            </div>
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

      {/* POS workspace: catalogue and selected products share the desktop width equally. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:grid xl:grid-cols-[60%_40%] xl:grid-rows-1">
        {/* CATALOGUE — col 1 */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background xl:h-full xl:min-h-0">
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
          </div>

            {posView === "browse" ? (
              <>
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

              </>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <p className="shrink-0 border-b border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
                  Scan mode — barcode / search above. For medicines, pick{" "}
                  <span className="font-semibold text-foreground">
                    batch / expiry
                  </span>{" "}
                  (and serials if required) on each line — same as Browse.
                </p>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-2 sm:p-3">
                  {cart.length === 0 ? (
                    <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                      <ScanBarcode className="mb-3 h-10 w-10 text-primary/50" />
                      <p className="text-sm font-semibold text-foreground">
                        Ready to scan
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                        Scan a barcode or type a name / SKU and press Enter. Added
                        products will list in this table.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((line) => {
                        const options = freeSerials(line.productId);
                        const units =
                          unitsMap[line.productId] ?? [];
                        const lineTotal = line.quantity * line.unitPrice;
                        const needsBatch =
                          (line.trackBatch || line.trackExpiry) &&
                          batchesFor(line.productId).length > 0;
                        return (
                          <div
                            key={line.productId}
                            className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold">
                                  {line.name}
                                </div>
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  {line.sku || "—"}
                                  {" · "}
                                  {line.unitPrice.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}{" "}
                                  / {line.unitLabel}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={() =>
                                  setCart((c) =>
                                    c.filter(
                                      (x) => x.productId !== line.productId,
                                    ),
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
                                  className="flex h-9 w-9 items-center justify-center text-primary"
                                  onClick={() =>
                                    setCart((c) =>
                                      c
                                        .map((x) =>
                                          x.productId === line.productId
                                            ? {
                                                ...x,
                                                quantity: Math.max(
                                                  0,
                                                  x.quantity - 1,
                                                ),
                                              }
                                            : x,
                                        )
                                        .filter((x) => x.quantity > 0),
                                    )
                                  }
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums">
                                  {line.quantity}
                                </span>
                                <button
                                  type="button"
                                  className="flex h-9 w-9 items-center justify-center text-primary"
                                  onClick={() =>
                                    setCart((c) =>
                                      c.map((x) =>
                                        x.productId === line.productId
                                          ? {
                                              ...x,
                                              quantity: x.quantity + 1,
                                            }
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
                                  className="h-9 min-w-[7.5rem] rounded-lg border bg-background px-2 text-xs"
                                  value={line.unitId ?? ""}
                                  onChange={(e) => {
                                    const unitId = e.target.value;
                                    if (unitId)
                                      setLineUnit(line.productId, unitId);
                                  }}
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

                            {needsBatch ? (
                              <select
                                className="mt-2 h-10 w-full rounded-lg border border-chart-3/40 bg-chart-3/10 px-2 text-xs font-medium"
                                value={line.selectedBatchId ?? ""}
                                onChange={(e) =>
                                  setCart((c) =>
                                    c.map((x) =>
                                      x.productId === line.productId
                                        ? {
                                            ...x,
                                            selectedBatchId:
                                              e.target.value || null,
                                          }
                                        : x,
                                    ),
                                  )
                                }
                              >
                                <option value="">
                                  Select batch / expiry (FEFO)…
                                </option>
                                {batchesFor(line.productId).map((b) => (
                                  <option key={b.batchId} value={b.batchId}>
                                    {b.batchNumber || "Batch"}
                                    {b.expiryDate
                                      ? ` · exp ${b.expiryDate}`
                                      : ""}
                                    {` · qty ${b.quantity}`}
                                  </option>
                                ))}
                              </select>
                            ) : null}

                            {line.serialized ? (
                              <div className="mt-2 max-h-24 space-y-1 overflow-y-auto rounded-lg border border-chart-5/30 bg-chart-5/10 p-2">
                                <p className="text-[10px] font-semibold text-chart-5">
                                  Serial / chassis numbers {line.selectedSerials.length}/
                                  {Math.round(
                                    line.quantity * (line.factorToStock || 1),
                                  )}
                                </p>
                                {options.length === 0 ? (
                                  <p className="text-[10px] text-muted-foreground">
                                    No free serial / chassis numbers in this warehouse
                                  </p>
                                ) : (
                                  options.map((serial) => (
                                    <label
                                      key={serial}
                                      className="flex cursor-pointer items-center gap-2 text-xs"
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
                                      <span className="font-mono">{serial}</span>
                                    </label>
                                  ))
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
        </section>


        {/* Selected products and customer details */}
        <section className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-t border-border/60 bg-gradient-to-b from-accent/20 via-accent/10 to-background xl:h-full xl:border-t-0 xl:border-l xl:border-border/60">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-semibold">Selected products</div>
                <div className="text-xs text-muted-foreground">
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

          {/* Selected products fill the cart panel above its compact customer shortcut. */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 pb-4 sm:p-3">
            <div className="space-y-2">
            {posView === "scan" ? (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {cart.length} line{cart.length === 1 ? "" : "s"}
                </span>
                {" "}
                on the main table · adjust qty / remove there. Use this panel for
                tender, customer and complete sale.
              </div>
            ) : cart.length === 0 ? (
              <div className="flex min-h-[3rem] items-center justify-center rounded-xl border border-dashed border-chart-2/40 bg-chart-2/10 p-3 text-center text-xs text-muted-foreground">
                Scan or tap products to start
              </div>
            ) : (
              cart.map((line) => {
                const options = freeSerials(line.productId);
                const units = unitsMap[line.productId] ?? [];
                const lineTotal = line.quantity * line.unitPrice;
                return (
                  <div
                    key={line.productId}
                    className="rounded-xl border border-border/60 bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold leading-snug">
                          {line.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
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
                          Serial / chassis numbers {line.selectedSerials.length}/
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
            </div>

          </div>
          <div className="shrink-0 border-t border-border/50 bg-accent/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <UserRound className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{customerLabel || "Customer details"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {customerLabel
                    ? `${customerPhone || "Selected customer"}${customerPoints != null ? ` · ${customerPoints} pts` : ""}`
                    : saleMode === "CREDIT"
                      ? "Choose an eligible credit customer"
                      : "Optional for cash sales"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 rounded-xl border-primary/25 text-primary hover:bg-primary/5"
                onClick={() => openCustomerDialog("select")}
              >
                {customerLabel ? "Change" : "Add details"}
              </Button>
              {customerId ? (
                <Button type="button" variant="ghost" className="shrink-0 px-2" onClick={clearCustomer}>
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 border-t border-border/50 p-2 sm:p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold tabular-nums">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {missingSerialLines.length > 0 ? (
              <p className="mb-2 rounded-lg border border-accent/60 bg-accent/25 px-3 py-2 text-xs font-medium leading-5 text-accent-foreground">
                Select the required serial / chassis numbers before checkout.
              </p>
            ) : null}
            <Button type="button" className="h-11 w-full rounded-xl font-bold" disabled={cart.length === 0 || missingSerialLines.length > 0} onClick={() => setCheckoutOpen(true)}>Checkout</Button>
          </div>
        </section>

        {/* CHECKOUT — modal */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b px-4 py-3">
              <DialogTitle>Checkout</DialogTitle>
            </DialogHeader>
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-2 pb-4 sm:p-3">
            <div
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                How is the customer paying?
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {payMethods.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={
                        "flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-center transition-all " +
                        (active
                          ? m.activeClass + " ring-2 ring-primary/40 shadow-sm"
                          : m.idleClass)
                      }
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      <span className="text-xs font-bold sm:text-sm">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {saleMode === "CASH" && paymentMethod === "MPESA" ? (
                <div className="mt-2 space-y-2 rounded-xl border border-chart-2/30 bg-chart-2/5 p-2.5">
                  <Label className="text-[11px] text-muted-foreground">Provider</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["MPESA", "AIRTEL", "OTHER"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setMobileProvider(p);
                          setSelectedCashAccountId(
                            p === "MPESA"
                              ? (mpesaAccounts[0]?.id ?? "")
                              : (mobileAccounts[0]?.id ?? mpesaAccounts[0]?.id ?? ""),
                          );
                        }}
                        className={
                          "rounded-lg px-2 py-1.5 text-xs font-semibold " +
                          (mobileProvider === p
                            ? "bg-chart-2 text-accent-foreground"
                            : "border bg-background")
                        }
                      >
                        {p === "MPESA" ? "M-Pesa" : p === "AIRTEL" ? "Airtel" : "Other"}
                      </button>
                    ))}
                  </div>
                  {(mobileProvider === "MPESA" ? mpesaAccounts : mobileAccounts).length > 0 ? (
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Till / account</Label>
                      <select
                        className="h-9 w-full rounded-xl border border-input bg-background px-2 text-sm"
                        value={selectedCashAccountId}
                        onChange={(e) => setSelectedCashAccountId(e.target.value)}
                      >
                        <option value="">Default till</option>
                        {(mobileProvider === "MPESA" ? mpesaAccounts : mobileAccounts.length ? mobileAccounts : mpesaAccounts).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                            {a.accountNumber ? ` · ${a.accountNumber}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Confirmation / ref no.
                    </Label>
                    <Input
                      className="h-9 rounded-xl"
                      placeholder="e.g. QGH12ABCDE"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                  {mpesaStkEnabled && mobileProvider === "MPESA" ? (
                    <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2">
                      <Button
                        type="button"
                        className="h-10 w-full rounded-xl font-semibold"
                        disabled={stkBusy || total <= 0}
                        onClick={() => void requestMpesaStk()}
                      >
                        {stkBusy
                          ? "Waiting for M-Pesa…"
                          : mpesaSim
                            ? "Send M-Pesa prompt (simulation)"
                            : "Send M-Pesa STK prompt"}
                      </Button>
                      {stkStatus ? (
                        <p className="text-center text-[11px] text-muted-foreground">
                          {stkStatus}
                        </p>
                      ) : (
                        <p className="text-center text-[10px] text-muted-foreground">
                          Uses customer phone above. Or type confirmation code manually.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {saleMode === "CASH" && paymentMethod === "BANK_TRANSFER" ? (
                <div className="mt-2 space-y-2 rounded-xl border border-chart-3/30 bg-chart-3/5 p-2.5">
                  <Label className="text-[11px] text-muted-foreground">Bank channel</Label>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                    {(["TRANSFER", "DEPOSIT", "RTGS", "EFT", "CHEQUE"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBankChannel(c)}
                        className={
                          "rounded-lg px-1.5 py-1.5 text-[10px] font-bold sm:text-xs " +
                          (bankChannel === c
                            ? "bg-chart-3 text-white"
                            : "border bg-background")
                        }
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Paid into (our bank)</Label>
                    <select
                      className="h-9 w-full rounded-xl border border-input bg-background px-2 text-sm"
                      value={selectedCashAccountId}
                      onChange={(e) => setSelectedCashAccountId(e.target.value)}
                    >
                      <option value="">Default bank account</option>
                      {bankAccounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                          {a.bankName ? ` · ${a.bankName}` : ""}
                          {a.accountNumber ? ` · ${a.accountNumber}` : ""}
                        </option>
                      ))}
                    </select>
                    {bankAccounts.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        Add bank accounts under Finance → Cash &amp; bank (type BANK + bank name / account no.).
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Customer&apos;s bank (origin)</Label>
                    <Input
                      className="h-9 rounded-xl"
                      placeholder="e.g. Equity, KCB"
                      value={originBank}
                      onChange={(e) => setOriginBank(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      Transaction / slip / RTGS ref
                    </Label>
                    <Input
                      className="h-9 rounded-xl"
                      placeholder="Reference number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}

              {saleMode === "CASH" && paymentMethod === "CARD" ? (
                <div className="mt-2 space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                  {cardAccounts.length > 0 ? (
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Terminal / account</Label>
                      <select
                        className="h-9 w-full rounded-xl border border-input bg-background px-2 text-sm"
                        value={selectedCashAccountId}
                        onChange={(e) => setSelectedCashAccountId(e.target.value)}
                      >
                        <option value="">Default card clearing</option>
                        {cardAccounts.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Auth / RRN (optional)</Label>
                    <Input
                      className="h-9 rounded-xl"
                      placeholder="Card reference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
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


          </div>

          {/* Sticky total + wizard / complete — primary action always visible */}
          <div className="shrink-0 space-y-2 border-t-2 border-primary/20 bg-card p-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)] sm:p-3">
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Total to pay
                </span>
                {cart.length > 0 ? (
                  <p className="text-[10px] text-muted-foreground">
                    {cart.length} line{cart.length === 1 ? "" : "s"}
                    {paymentMethod && saleMode === "CASH"
                      ? ` · ${paymentMethod === "MPESA" ? "M-Pesa" : paymentMethod === "CASH" ? "Cash" : paymentMethod === "CARD" ? "Card" : "Bank"}`
                      : saleMode === "CREDIT"
                        ? " · Credit"
                        : ""}
                  </p>
                ) : null}
              </div>
              <span className="text-3xl font-black tabular-nums leading-none text-primary">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Mobile: step 1 → continue to pay */}
            {/* Mobile step 2 + always on desktop: sale type + complete */}
            <div
              className="space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaleMode("CASH");
                    if (paymentMethod === "CREDIT") setPaymentMethod("CASH");
                  }}
                  className={
                    saleMode === "CASH"
                      ? "min-h-[3rem] rounded-2xl border-2 border-primary bg-primary/10 px-2 py-2.5 text-sm font-bold text-primary"
                      : "min-h-[3rem] rounded-2xl border border-border bg-muted/40 px-2 py-2.5 text-sm font-medium text-muted-foreground"
                  }
                >
                  Cash sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaleMode("CREDIT");
                    setPaymentMethod("CREDIT");
                    setCheckoutOpen(false);
                    openCustomerDialog("select");
                  }}
                  className={
                    saleMode === "CREDIT"
                      ? "min-h-[3rem] rounded-2xl border-2 border-primary bg-primary/10 px-2 py-2.5 text-sm font-bold text-primary"
                      : "min-h-[3rem] rounded-2xl border border-border bg-muted/40 px-2 py-2.5 text-sm font-medium text-muted-foreground"
                  }
                >
                  Credit invoice
                </button>
              </div>
              {saleMode === "CREDIT" ? (
                <p className="text-[11px] text-muted-foreground">
                  Posts to Accounts Receivable. Customer required before
                  completing.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Pay now (cash, M-Pesa, card…). Customer optional for loyalty.
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  className="h-12 w-full rounded-xl text-base font-bold shadow-md"
                  size="lg"
                  disabled={
                    pending ||
                    cart.length === 0 ||
                    missingSerialLines.length > 0
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
            </div>
          </div>
            </section>
          </DialogContent>
        </Dialog>

        <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
          <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
            <div className="brand-stripe h-2 w-full shrink-0" />
            <DialogHeader className="shrink-0 border-b px-5 py-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {customerDialogMode === "select" ? "Customer details" : "Create customer"}
              </DialogTitle>
              <DialogDescription className="leading-5">
                {saleMode === "CREDIT"
                  ? "Select a customer approved for credit, or create a credit customer account."
                  : "Select an existing customer or add details for this sale."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex shrink-0 gap-2 border-b bg-muted/30 px-5 py-3">
              <Button
                type="button"
                variant={customerDialogMode === "select" ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => setCustomerDialogMode("select")}
              >
                Select customer
              </Button>
              <Button
                type="button"
                variant={customerDialogMode === "create" ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => openCustomerDialog("create")}
              >
                Create customer
              </Button>
            </div>

            {customerDialogMode === "select" ? (
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <div className="space-y-2">
                  <Label htmlFor="pos-customer-select">
                    {saleMode === "CREDIT" ? "Credit customer" : "Customer"}
                  </Label>
                  <select
                    id="pos-customer-select"
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    value={
                      saleMode === "CREDIT" &&
                      !posCustomers.find((customer) => customer.id === customerId)?.allowCredit
                        ? ""
                        : customerId ?? ""
                    }
                    onChange={(event) => {
                      const selected = posCustomers.find((customer) => customer.id === event.target.value);
                      if (!selected) {
                        clearCustomer();
                        return;
                      }
                      setCustomerId(selected.id);
                      setCustomerLabel(selected.displayName);
                      setCustomerContactName(selected.contactName);
                      setCustomerPhone(selected.phone ?? "");
                      setCustomerName(selected.contactName || selected.displayName);
                      setCustomerPoints(selected.loyaltyPoints);
                    }}
                  >
                    <option value="">
                      {saleMode === "CREDIT" ? "Choose an eligible customer…" : "Walk-in / no customer"}
                    </option>
                    {(saleMode === "CREDIT" ? posCustomers.filter((customer) => customer.allowCredit) : posCustomers).map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.displayName}{customer.phone ? ` · ${customer.phone}` : ""}{customer.allowCredit ? " · Credit" : ""}
                      </option>
                    ))}
                  </select>
                  {saleMode === "CREDIT" && posCustomers.filter((customer) => customer.allowCredit).length === 0 ? (
                    <p className="rounded-xl border border-accent/50 bg-accent/20 p-3 text-sm leading-5 text-foreground">
                      No credit customers are available yet. Create a customer and enable a credit account to continue.
                    </p>
                  ) : null}
                  {saleMode === "CREDIT" &&
                  posCustomers.some((customer) => customer.allowCredit) &&
                  customerId &&
                  !posCustomers.find((customer) => customer.id === customerId)?.allowCredit ? (
                    <p className="rounded-xl border border-accent/50 bg-accent/20 p-3 text-sm leading-5 text-foreground">
                      The currently selected customer is not enabled for credit. Choose an eligible account or create a credit customer.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    className="h-10 rounded-xl"
                    inputMode="tel"
                    placeholder="Find customer by phone"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void lookupCustomer();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl border-primary/25 text-primary"
                    disabled={lookingUp || !customerPhone.trim()}
                    onClick={() => void lookupCustomer()}
                  >
                    {lookingUp ? "Searching…" : "Find by phone"}
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void createPosCustomer();
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pos-customer-first">First name *</Label>
                    <Input id="new-pos-customer-first" className="h-10 rounded-xl" required value={newCustomer.firstName} onChange={(event) => setNewCustomer((current) => ({ ...current, firstName: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pos-customer-last">Last name</Label>
                    <Input id="new-pos-customer-last" className="h-10 rounded-xl" value={newCustomer.lastName} onChange={(event) => setNewCustomer((current) => ({ ...current, lastName: event.target.value }))} />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="new-pos-customer-phone">Phone *</Label>
                    <Input id="new-pos-customer-phone" className="h-10 rounded-xl" required minLength={7} inputMode="tel" value={newCustomer.phone} onChange={(event) => setNewCustomer((current) => ({ ...current, phone: event.target.value }))} />
                  </div>
                  {saleMode === "CREDIT" ? (
                    <>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="new-pos-customer-id">National ID / passport *</Label>
                        <Input id="new-pos-customer-id" className="h-10 rounded-xl" required value={newCustomer.idNumber} onChange={(event) => setNewCustomer((current) => ({ ...current, idNumber: event.target.value }))} />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor="new-pos-customer-address">Physical address *</Label>
                        <Input id="new-pos-customer-address" className="h-10 rounded-xl" required value={newCustomer.address} onChange={(event) => setNewCustomer((current) => ({ ...current, address: event.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-next-kin">Next of kin *</Label>
                        <Input id="new-pos-customer-next-kin" className="h-10 rounded-xl" required value={newCustomer.emergencyContact} onChange={(event) => setNewCustomer((current) => ({ ...current, emergencyContact: event.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-next-kin-phone">Next of kin phone *</Label>
                        <Input id="new-pos-customer-next-kin-phone" className="h-10 rounded-xl" required minLength={7} inputMode="tel" value={newCustomer.emergencyPhone} onChange={(event) => setNewCustomer((current) => ({ ...current, emergencyPhone: event.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="new-pos-customer-limit">Credit limit (KES) *</Label>
                        <Input id="new-pos-customer-limit" className="h-10 rounded-xl" required type="number" min="1" step="0.01" value={newCustomer.creditLimit} onChange={(event) => setNewCustomer((current) => ({ ...current, creditLimit: event.target.value }))} />
                      </div>
                      <p className="self-end text-xs leading-5 text-muted-foreground">The customer will be enabled for credit using this limit.</p>
                    </>
                  ) : null}
                </div>
                <DialogFooter className="-mx-5 -mb-5 border-t bg-muted/30 px-5 py-4">
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCustomerDialogMode("select")}>
                    Back
                  </Button>
                  <Button type="submit" className="rounded-xl" disabled={customerSaving}>
                    {customerSaving ? "Saving…" : saleMode === "CREDIT" ? "Create credit customer" : "Create customer"}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {customerDialogMode === "select" ? (
              <DialogFooter className="shrink-0 border-t bg-muted/30 px-5 py-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setCustomerDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  disabled={saleMode === "CREDIT" && !posCustomers.find((customer) => customer.id === customerId)?.allowCredit}
                  onClick={() => {
                    setCustomerDialogOpen(false);
                    if (saleMode === "CREDIT") setCheckoutOpen(true);
                  }}
                >
                  {saleMode === "CREDIT" ? "Continue to checkout" : "Use customer"}
                </Button>
              </DialogFooter>
            ) : null}
          </DialogContent>
        </Dialog>

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
