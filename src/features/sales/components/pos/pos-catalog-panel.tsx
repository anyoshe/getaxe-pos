"use client";

import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";
import { Minus, Plus, ScanBarcode, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarcodeScanner } from "@/features/inventory/components/products/entry/barcode-scanner";
import type {
  CartLine,
  PosBatchOption,
  PosProduct,
  PosProductUnit,
  PriceMode,
} from "./pos-types";

export type PosCatalogPanelProps = {
  scanRef: RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (v: string) => void;
  onScanKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  posView: "browse" | "scan";
  showCamera: boolean;
  setShowCamera: Dispatch<SetStateAction<boolean>>;
  categoryFilter: string;
  setCategoryFilter: (id: string) => void;
  categories: { id: string; name: string }[];
  catalogLayout: "grid" | "list" | "compact";
  setCatalogLayout: (l: "grid" | "list" | "compact") => void;
  sellable: PosProduct[];
  filtered: PosProduct[];
  visibleProducts: PosProduct[];
  setVisibleCount: Dispatch<SetStateAction<number>>;
  stockOnHand: (productId: string, whId?: string) => number;
  addProduct: (p: PosProduct) => void;
  cart: CartLine[];
  setCart: Dispatch<SetStateAction<CartLine[]>>;
  unitsMap: Record<string, PosProductUnit[]>;
  priceMode: PriceMode;
  resolveCode: (code: string) => void;
  setLineUnit: (productId: string, unitId: string) => void;
  batchesFor: (productId: string) => PosBatchOption[];
  toggleSerial: (productId: string, serial: string) => void;
  freeSerials: (productId: string) => string[];
  searchHits: (term: string, limit?: number) => PosProduct[];
};

export function PosCatalogPanel({
  scanRef,
  query,
  setQuery,
  onScanKeyDown,
  posView,
  showCamera,
  setShowCamera,
  categoryFilter,
  setCategoryFilter,
  categories,
  catalogLayout,
  setCatalogLayout,
  sellable,
  filtered,
  visibleProducts,
  setVisibleCount,
  stockOnHand,
  addProduct,
  cart,
  setCart,
  unitsMap,
  priceMode,
  resolveCode,
  setLineUnit,
  batchesFor,
  toggleSerial,
  freeSerials,
  searchHits,
}: PosCatalogPanelProps) {
  const browsing = Boolean(query.trim()) || categoryFilter !== "all";
  const hasMore = visibleProducts.length < filtered.length;
  const searchSuggestions = query.trim() ? searchHits(query, 15) : [];

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pb-20 xl:h-full xl:min-h-0 xl:pb-0">
          <div className="z-10 shrink-0 space-y-2 border-b border-border/50 bg-background/95 p-2.5 backdrop-blur sm:p-3 xl:px-5 2xl:px-7">
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
            <div className="flex items-center gap-2 xl:ml-2">
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
              "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] p-2 sm:p-3 xl:px-5 2xl:px-7 " +
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



  );
}
