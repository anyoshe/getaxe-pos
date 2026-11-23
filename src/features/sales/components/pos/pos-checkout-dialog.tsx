"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Banknote,
  Building2,
  CreditCard,
  Smartphone,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PosCustomerOption } from "../../actions/pos-customer";
import type { CartLine } from "./pos-types";

type CashAccount = {
  id: string;
  name: string;
  type: string;
  bankName?: string | null;
  accountNumber?: string | null;
};

export type PosCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleMode: "CASH" | "CREDIT";
  setSaleMode: (m: "CASH" | "CREDIT") => void;
  paymentMethod: string;
  setPaymentMethod: (m: any) => void;
  mobileProvider: "MPESA" | "AIRTEL" | "OTHER";
  setMobileProvider: (p: "MPESA" | "AIRTEL" | "OTHER") => void;
  bankChannel: string;
  setBankChannel: (c: any) => void;
  selectedCashAccountId: string;
  setSelectedCashAccountId: (id: string) => void;
  mpesaAccounts: CashAccount[];
  mobileAccounts: CashAccount[];
  bankAccounts: CashAccount[];
  cardAccounts: CashAccount[];
  originBank: string;
  setOriginBank: (v: string) => void;
  paymentReference: string;
  setPaymentReference: (v: string) => void;
  amountTendered: string;
  setAmountTendered: (v: string) => void;
  changeDue: number | null;
  total: number;
  cart: CartLine[];
  customerId: string | null;
  customerLabel: string | null;
  customerPhone: string;
  customerPoints: number | null;
  posCustomers: PosCustomerOption[];
  mpesaStkEnabled: boolean;
  stkBusy: boolean;
  requestMpesaStk: () => Promise<void>;
  mpesaSim: boolean;
  stkStatus: string | null;
  clearCustomer: () => void;
  openCustomerDialog: (mode?: "select" | "create") => void;
  pending: boolean;
  missingSerialLines: CartLine[];
  checkout: () => void;
  payMethods: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeClass: string;
    idleClass: string;
  }>;
};

export function PosCheckoutDialog(props: PosCheckoutDialogProps) {
  const {
    open,
    onOpenChange,
    saleMode,
    setSaleMode,
    paymentMethod,
    setPaymentMethod,
    mobileProvider,
    setMobileProvider,
    bankChannel,
    setBankChannel,
    selectedCashAccountId,
    setSelectedCashAccountId,
    mpesaAccounts,
    mobileAccounts,
    bankAccounts,
    cardAccounts,
    originBank,
    setOriginBank,
    paymentReference,
    setPaymentReference,
    amountTendered,
    setAmountTendered,
    changeDue,
    total,
    cart,
    customerId,
    customerLabel,
    customerPhone,
    customerPoints,
    posCustomers,
    mpesaStkEnabled,
    stkBusy,
    requestMpesaStk,
    mpesaSim,
    stkStatus,
    clearCustomer,
    openCustomerDialog,
    pending,
    missingSerialLines,
    checkout,
    payMethods,
  } = props;

  // Map dialog open to checkoutOpen for JSX that still uses setCheckoutOpen in sticky - should not
  const checkoutOpen = open;
  const setCheckoutOpen = onOpenChange;

  return (
<Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
            <DialogHeader className="shrink-0 border-b px-4 py-3">
              <DialogTitle>Step 3 · Take payment</DialogTitle>
            </DialogHeader>
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-2 pb-4 sm:p-3">
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-2.5">
              <p className="text-sm font-semibold text-foreground">
                1. Cash now or credit?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSaleMode("CASH");
                    if (paymentMethod === "CREDIT") setPaymentMethod("CASH");
                  }}
                  className={
                    saleMode === "CASH"
                      ? "min-h-[2.75rem] rounded-xl border-2 border-primary bg-primary/10 px-2 py-2 text-sm font-bold text-primary"
                      : "min-h-[2.75rem] rounded-xl border border-border bg-background px-2 py-2 text-sm font-medium text-muted-foreground"
                  }
                >
                  Pay now
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaleMode("CREDIT");
                    setPaymentMethod("CREDIT");
                  }}
                  className={
                    saleMode === "CREDIT"
                      ? "min-h-[2.75rem] rounded-xl border-2 border-primary bg-primary/10 px-2 py-2 text-sm font-bold text-primary"
                      : "min-h-[2.75rem] rounded-xl border border-border bg-background px-2 py-2 text-sm font-medium text-muted-foreground"
                  }
                >
                  Credit (later)
                </button>
              </div>
            </div>
            <div
              className="space-y-2"
            >
              <p className="text-sm font-semibold text-foreground">
                {saleMode === "CREDIT"
                  ? "2. Credit sale — no till payment"
                  : "2. How are they paying?"}
              </p>
              {saleMode === "CASH" ? (
              <>
              <div className="grid grid-cols-2 gap-2.5">
                {payMethods.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={
                        "flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-center transition-all " +
                        (active
                          ? m.activeClass + " ring-1 ring-primary/30 shadow-sm"
                          : m.idleClass)
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">
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
              </>
              ) : (
                <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                  Credit sale — no cash, M-Pesa, or card on this screen. Choose the customer below, then finish.
                </p>
              )}
            </div>

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

            {/* Customer + complete — mode chosen above in scroll area */}
            <div
              className="space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground">
                3. Customer · then finish
              </p>
              {saleMode === "CREDIT" ? (
                <p className="text-[11px] text-muted-foreground">
                  Customer must be on credit — choose or create them below before finishing.
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Choose how they pay above. Customer is optional (loyalty / receipt name).
                </p>
              )}
              {/* Customer always after cash vs credit — optional on cash, required on credit */}
              <div
                className={
                  "rounded-xl border p-3 " +
                  (saleMode === "CREDIT"
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/60 bg-muted/30")
                }
              >
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {saleMode === "CREDIT" ? "Customer (required)" : "Customer (optional)"}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {customerLabel ||
                        (saleMode === "CREDIT"
                          ? "Select credit customer"
                          : "Walk-in / no customer")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {customerLabel
                        ? `${customerPhone || "Selected"}${customerPoints != null ? ` · ${customerPoints} pts` : ""}`
                        : saleMode === "CREDIT"
                          ? "Must allow credit"
                          : "Skip if cash walk-in"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 rounded-xl border-primary/25 px-2 text-xs text-primary hover:bg-primary/5"
                    onClick={() => openCustomerDialog("select")}
                  >
                    {customerLabel ? "Change" : saleMode === "CREDIT" ? "Select" : "Add"}
                  </Button>
                  {customerId && saleMode === "CASH" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="shrink-0 px-2"
                      onClick={clearCustomer}
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-12 w-full rounded-xl text-base font-bold shadow-md"
                  size="lg"
                  disabled={
                    pending ||
                    cart.length === 0 ||
                    missingSerialLines.length > 0 ||
                    (saleMode === "CREDIT" &&
                      !posCustomers.find((c) => c.id === customerId)?.allowCredit)
                  }
                  onClick={checkout}
                >
                  {pending
                    ? "Please wait…"
                    : saleMode === "CREDIT"
                      ? "Finish — customer pays later"
                      : "Finish sale"}
                </Button>
              </div>
            </div>
          </div>
            </section>
          </DialogContent>
        </Dialog>

  );
}
