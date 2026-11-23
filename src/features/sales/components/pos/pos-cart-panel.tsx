"use client";

import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CartLine, PosBatchOption } from "./pos-types";

export type PosCartPanelProps = {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  total: number;
  missingSerialLines: CartLine[];
  notifyMissingSerials: () => boolean;
  setCheckoutOpen: (open: boolean) => void;
  batchesFor: (productId: string) => PosBatchOption[];
  toggleSerial: (productId: string, serial: string) => void;
  freeSerials: (productId: string) => string[];
};

export function PosCartPanel({
  cart,
  setCart,
  total,
  missingSerialLines,
  notifyMissingSerials,
  setCheckoutOpen,
  batchesFor,
  toggleSerial,
  freeSerials,
}: PosCartPanelProps) {
  return (
        {/* Selected products and customer details */}
        <section className="hidden min-h-0 w-full flex-1 flex-col overflow-hidden border-t border-border/60 bg-gradient-to-b from-accent/20 via-accent/10 to-background xl:flex xl:h-full xl:border-t-0 xl:border-l xl:border-border/60">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div>
                <div className="text-base font-semibold">Step 2 · Your list</div>
                <div className="text-xs text-muted-foreground">
                  {cart.length} product{cart.length === 1 ? "" : "s"} — change numbers if needed
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
                Step 1 first: scan or tap products on the left
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
            <Button
              type="button"
              className="h-12 w-full rounded-xl text-base font-bold"
              disabled={cart.length === 0}
              onClick={() => {
                if (!notifyMissingSerials()) setCheckoutOpen(true);
              }}
            >
              Next: Pay
            </Button>
          </div>
        </section>


  );
}
