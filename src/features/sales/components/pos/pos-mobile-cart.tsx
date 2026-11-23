"use client";

import type { Dispatch, SetStateAction } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { CartLine } from "./pos-types";

type PosMobileCartProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  cart: CartLine[];
  total: number;
  setCart: Dispatch<SetStateAction<CartLine[]>>;
  freeSerials: (productId: string) => string[];
  toggleSerial: (productId: string, serial: string) => void;
  notifyMissingSerials: () => boolean;
  setCheckoutOpen: (open: boolean) => void;
};

export function PosMobileCart({
  open,
  setOpen,
  cart,
  total,
  setCart,
  freeSerials,
  toggleSerial,
  notifyMissingSerials,
  setCheckoutOpen,
}: PosMobileCartProps) {
  return (
    <>
      {/* Mobile: catalog-only + bottom bar + cart sheet → checkout dialog */}
      <div className="xl:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-14 flex-1 items-center justify-between gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2 text-left"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {cart.length === 0
                    ? "Your list is empty"
                    : `${cart.length} product${cart.length === 1 ? "" : "s"}`}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {cart.length === 0
                    ? "Search or scan a product first"
                    : "Tap to check quantities"}
                </span>
              </span>
            </span>
            <span className="text-lg font-black tabular-nums text-primary">
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </button>
          <Button
            type="button"
            className="h-14 shrink-0 rounded-2xl px-5 text-base font-bold"
            disabled={cart.length === 0}
            onClick={() => {
              if (!notifyMissingSerials()) {
                setOpen(false);
                setCheckoutOpen(true);
              } else {
                setOpen(true);
              }
            }}
          >
            Pay
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
        >
          <SheetHeader className="shrink-0 border-b px-4 py-3 text-left">
            <SheetTitle className="flex items-center justify-between gap-2">
              <span>Step 2 · Your list ({cart.length})</span>
              <span className="text-base font-black tabular-nums text-primary">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </SheetTitle>
            <p className="text-xs text-muted-foreground">
              Check numbers are correct, then press <strong>Next: Pay</strong>.
            </p>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-3">
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No products yet. Close and scan or tap items.
              </div>
            ) : (
              cart.map((line) => {
                const options = freeSerials(line.productId);
                return (
                  <div
                    key={line.productId}
                    className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {line.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          @{" "}
                          {line.unitPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold text-destructive"
                        onClick={() =>
                          setCart((c) =>
                            c.filter((x) => x.productId !== line.productId),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold"
                          onClick={() =>
                            setCart((c) =>
                              c
                                .map((x) =>
                                  x.productId === line.productId
                                    ? {
                                        ...x,
                                        quantity: Math.max(
                                          0,
                                          Number(x.quantity) - 1,
                                        ),
                                      }
                                    : x,
                                )
                                .filter((x) => x.quantity > 0),
                            )
                          }
                        >
                          −
                        </button>
                        <input
                          className="h-9 w-12 border-0 bg-transparent text-center text-sm font-semibold tabular-nums outline-none"
                          type="number"
                          min={0}
                          step="any"
                          value={line.quantity}
                          onChange={(e) => {
                            const q = Number(e.target.value);
                            setCart((c) =>
                              c
                                .map((x) =>
                                  x.productId === line.productId
                                    ? { ...x, quantity: q }
                                    : x,
                                )
                                .filter((x) => x.quantity > 0),
                            );
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-md text-lg font-bold"
                          onClick={() =>
                            setCart((c) =>
                              c.map((x) =>
                                x.productId === line.productId
                                  ? { ...x, quantity: Number(x.quantity) + 1 }
                                  : x,
                              ),
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="text-sm font-bold tabular-nums">
                        {(line.unitPrice * line.quantity).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </div>
                    </div>
                    {line.serialized ? (
                      <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-chart-5/30 bg-chart-5/10 p-2">
                        <p className="text-[10px] font-semibold text-chart-5">
                          Serial / chassis numbers {line.selectedSerials.length}
                          /
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
                              className="flex min-h-8 cursor-pointer items-center gap-2 text-xs"
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
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <SheetFooter className="shrink-0 gap-2 border-t bg-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-col">
            <div className="flex w-full items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-black tabular-nums text-primary">
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => setOpen(false)}
              >
                Add more
              </Button>
              <Button
                type="button"
                className="h-12 rounded-xl font-bold"
                disabled={cart.length === 0 || total <= 0}
                onClick={() => {
                  if (notifyMissingSerials()) return;
                  setOpen(false);
                  setCheckoutOpen(true);
                }}
              >
                Next: Pay
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
