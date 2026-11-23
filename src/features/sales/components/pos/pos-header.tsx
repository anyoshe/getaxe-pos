"use client";

import type { Dispatch, SetStateAction } from "react";
import Link from "next/link";

import type { BranchOption, PriceMode, WarehouseOption } from "./pos-types";

type PosHeaderProps = {
  cashierName?: string | null;
  branches: BranchOption[];
  branchId: string;
  posStep: 1 | 2 | 3;
  posView: "browse" | "scan";
  setPosView: (view: "browse" | "scan") => void;
  posOptionsOpen: boolean;
  setPosOptionsOpen: Dispatch<SetStateAction<boolean>>;
  fullScreen: boolean;
  priceMode: PriceMode;
  setPriceMode: (mode: PriceMode) => void;
  warehouseId: string;
  setWarehouseId: (id: string) => void;
  warehouses: WarehouseOption[];
  onWarehouseChange: (id: string) => void;
};

export function PosHeader({
  cashierName,
  branches,
  branchId,
  posStep,
  posView,
  setPosView,
  posOptionsOpen,
  setPosOptionsOpen,
  fullScreen,
  priceMode,
  setPriceMode,
  warehouseId,
  setWarehouseId,
  warehouses,
  onWarehouseChange,
}: PosHeaderProps) {
  return (
    <>
      <header className="brand-gradient relative z-10 shrink-0 text-primary-foreground shadow-md">
        <div className="mx-auto flex w-full flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-3 xl:max-w-[1720px] xl:px-8 2xl:px-12">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card/20 text-xs font-black backdrop-blur sm:h-10 sm:w-10 sm:text-sm">
              GA
            </div>
            <div className="min-w-0">
              <div className="text-base font-bold tracking-tight sm:text-lg">
                Sell
              </div>
              <div className="truncate text-[10px] text-white/80 sm:text-xs">
                {cashierName ? cashierName : "Cashier"}
                {branchId
                  ? ` · ${branches.find((b) => b.id === branchId)?.name ?? ""}`
                  : ""}
              </div>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {/* Default = search/scan; pick-from-list is optional */}
            <div className="flex rounded-full bg-black/20 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setPosView("scan")}
                className={
                  posView === "scan"
                    ? "rounded-full bg-card px-3 py-1.5 text-foreground shadow-sm"
                    : "rounded-full px-3 py-1.5 text-white/85"
                }
              >
                Search / scan
              </button>
              <button
                type="button"
                onClick={() => setPosView("browse")}
                className={
                  posView === "browse"
                    ? "rounded-full bg-card px-3 py-1.5 text-foreground shadow-sm"
                    : "rounded-full px-3 py-1.5 text-white/85"
                }
              >
                Pick from list
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPosOptionsOpen((v) => !v)}
              className="rounded-lg bg-card/15 px-3 py-2 text-xs font-medium hover:bg-card/25"
            >
              {posOptionsOpen ? "Hide options" : "More options"}
            </button>
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

          {posOptionsOpen ? (
            <div className="flex w-full flex-wrap items-center gap-2 border-t border-white/15 pt-2">
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
                    {m === "retail" ? "Normal price" : "Wholesale price"}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-[11px] text-white/90">
                <span className="shrink-0">Store room</span>
                <select
                  className="h-9 max-w-[11rem] rounded-lg border-0 bg-card/15 px-2 text-xs text-white outline-none"
                  value={warehouseId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setWarehouseId(id);
                    onWarehouseChange(id);
                  }}
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id} className="text-foreground">
                      {w.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      </header>

      {/* Step guide — always visible so staff know order of work */}
      <div className="shrink-0 border-b border-border/60 bg-card px-3 py-2 sm:px-5 xl:px-8">
        <div className="mx-auto flex max-w-[1720px] items-stretch gap-1 sm:gap-2">
          {(
            [
              {
                n: 1 as const,
                label: "1. Find products",
                hint: "Search, scan or tap",
              },
              {
                n: 2 as const,
                label: "2. Check list",
                hint: "Change quantities",
              },
              {
                n: 3 as const,
                label: "3. Take payment",
                hint: "Cash, M-Pesa or credit",
              },
            ] as const
          ).map((s) => {
            const active = posStep === s.n;
            const done = posStep > s.n;
            return (
              <div
                key={s.n}
                className={
                  "flex min-w-0 flex-1 flex-col rounded-xl border px-2 py-1.5 sm:px-3 " +
                  (active
                    ? "border-primary bg-primary/10 shadow-sm"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border/50 bg-muted/30")
                }
              >
                <span
                  className={
                    "text-[11px] font-bold sm:text-xs " +
                    (active
                      ? "text-primary"
                      : done
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-muted-foreground")
                  }
                >
                  {done && !active ? "✓ " : ""}
                  {s.label}
                </span>
                <span className="hidden text-[10px] text-muted-foreground sm:block">
                  {s.hint}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-1.5 max-w-[1720px] text-[11px] text-muted-foreground sm:text-xs">
          {posStep === 1
            ? "Start here: type a name, barcode, or scan — or switch to Pick from list."
            : posStep === 2
              ? "Products added — open the list to change numbers, then pay."
              : "Choose how the customer pays, then finish the sale."}
        </p>
      </div>
    </>
  );
}
