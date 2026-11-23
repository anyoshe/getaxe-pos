"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { searchPosProductsAction } from "@/features/sales/actions/search-pos-products";
import { applyPromotion } from "@/features/inventory/services/promotion-price";
import type { ReceiptData } from "./sale-receipt";
import { usePosCustomerState } from "./use-pos-customer-state";
import type {
  CartLine,
  PosBatchOption,
  PosClientProps,
  PosProduct,
  PosProductUnit,
  PriceMode,
  SerialsByProduct,
} from "./pos-types";

export function usePosClientState(props: PosClientProps) {
  const {
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
  } = props;

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
              supplyChannel:
                (raw as { supplyChannel?: string }).supplyChannel ?? "private",
              costPrice: raw.costPrice,
              retailPrice: Number(raw.retailPrice ?? 0),
              wholesalePrice: Number(raw.wholesalePrice ?? 0),
              unitPrice: Number(raw.sellingPrice ?? raw.retailPrice ?? 0),
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
  const [catalogLayout, setCatalogLayout] = useState<
    "grid" | "list" | "compact"
  >("grid");
  /** browse = product catalogue; scan = search/scan + cart table (no product grid) */
  const [posView, setPosView] = useState<"browse" | "scan">("scan");
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
      const ea = a.expiryDate
        ? Date.parse(a.expiryDate)
        : Number.POSITIVE_INFINITY;
      const eb = b.expiryDate
        ? Date.parse(b.expiryDate)
        : Number.POSITIVE_INFINITY;
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
  const [mobileProvider, setMobileProvider] = useState<
    "MPESA" | "AIRTEL" | "OTHER"
  >("MPESA");
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
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [posOptionsOpen, setPosOptionsOpen] = useState(false);
  const customerState = usePosCustomerState(saleMode, setCheckoutOpen);
  const {
    customerDialogOpen,
    setCustomerDialogOpen,
    customerDialogMode,
    setCustomerDialogMode,
    customerSaving,
    setCustomerSaving,
    newCustomer,
    setNewCustomer,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    customerId,
    setCustomerId,
    customerLabel,
    setCustomerLabel,
    customerPoints,
    setCustomerPoints,
    customerContactName,
    setCustomerContactName,
    posCustomers,
    setPosCustomers,
    earnPreview,
    setEarnPreview,
    lookingUp,
    setLookingUp,
    lookupCustomer,
    clearCustomer,
    openCustomerDialog,
    createPosCustomer,
  } = customerState;
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
      const base = priceMode === "wholesale" ? p.wholesalePrice : p.retailPrice;
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
        if (p.productType === "service" || p.trackInventory === false)
          return true;
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
      const factor =
        u?.factorToStock && u.factorToStock > 0 ? u.factorToStock : 1;
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
        const nextQtyStock = ((existing?.quantity ?? 0) + 1) * factor;
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
              p.trackBatch || p.trackExpiry ? pickFefoBatchId(p.id) : null,
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
    const u = (unitsMap[productId] ?? []).find((x) => x.unitId === unitId);
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
        (p) => p.barcode?.toLowerCase() === key || p.sku?.toLowerCase() === key,
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

    scored.sort(
      (a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name),
    );
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

  function notifyMissingSerials() {
    if (missingSerialLines.length === 0) return false;
    toast.error(
      `Select one serial / chassis number for each unit of: ${missingSerialLines.map((line) => line.name).join(", ")}.`,
    );
    return true;
  }

  // Client-side estimate: 1 pt per 100 (server program may differ; refreshed on lookup)
  const estimatedEarn = customerId && total > 0 ? Math.floor(total / 100) : 0;

  return {
    scanRef,
    catalog,
    setCatalog,
    setStockMap,
    unitsMap,
    setUnitsMap,
    pricesMap,
    setPricesMap,
    batchesMap,
    setBatchesMap,
    serialsMap,
    setSerialsMap,
    searching,
    setSearching,
    query,
    setQuery,
    sellable,
    productByCode,
    categoryFilter,
    setCategoryFilter,
    catalogLayout,
    setCatalogLayout,
    posView,
    setPosView,
    visibleCount,
    setVisibleCount,
    priceMode,
    setPriceMode,
    warehouseId,
    setWarehouseId,
    branchId,
    setBranchId,
    paymentMethod,
    setPaymentMethod,
    mobileProvider,
    setMobileProvider,
    mpesaStkEnabled,
    setMpesaStkEnabled,
    mpesaSim,
    setMpesaSim,
    stkBusy,
    setStkBusy,
    stkStatus,
    setStkStatus,
    bankChannel,
    setBankChannel,
    paymentReference,
    setPaymentReference,
    originBank,
    setOriginBank,
    selectedCashAccountId,
    setSelectedCashAccountId,
    saleMode,
    setSaleMode,
    lastReceipt,
    setLastReceipt,
    amountTendered,
    setAmountTendered,
    checkoutOpen,
    setCheckoutOpen,
    mobileCartOpen,
    setMobileCartOpen,
    posOptionsOpen,
    setPosOptionsOpen,
    customerDialogOpen,
    setCustomerDialogOpen,
    customerDialogMode,
    setCustomerDialogMode,
    customerSaving,
    setCustomerSaving,
    newCustomer,
    setNewCustomer,
    customerPhone,
    setCustomerPhone,
    customerName,
    setCustomerName,
    customerId,
    setCustomerId,
    customerLabel,
    setCustomerLabel,
    customerPoints,
    setCustomerPoints,
    customerContactName,
    setCustomerContactName,
    posCustomers,
    setPosCustomers,
    earnPreview,
    setEarnPreview,
    lookingUp,
    setLookingUp,
    cart,
    setCart,
    setSerialPool,
    showCamera,
    setShowCamera,
    stockOnHand,
    batchesFor,
    pickFefoBatchId,
    priceFor,
    categories,
    filtered,
    visibleProducts,
    freeSerials,
    defaultUnitFor,
    addProduct,
    setLineUnit,
    searchHits,
    resolveCode,
    onScanKeyDown,
    toggleSerial,
    lookupCustomer,
    clearCustomer,
    openCustomerDialog,
    createPosCustomer,
    total,
    missingSerialLines,
    notifyMissingSerials,
    estimatedEarn,
  };
}
