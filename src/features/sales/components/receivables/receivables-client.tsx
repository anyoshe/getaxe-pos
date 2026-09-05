"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SaleReceipt,
  type ReceiptBusiness,
  type ReceiptData,
} from "@/features/sales/components/pos/sale-receipt";
import { receiveCreditPaymentAction } from "@/features/sales/actions/receive-credit-payment";

export type OpenInvoice = {
  id: string;
  invoiceNumber: string;
  soldAt: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: string;
  customerId: string | null;
  customerName: string;
  contactName: string | null;
  phone: string | null;
};

export type ArAccount = {
  customerId: string;
  customerName: string;
  phone: string | null;
  creditLimit: number;
  openInvoices: number;
  balance: number;
  totalInvoiced: number;
  totalPaid: number;
};

function money(n: number) {
  return `KES ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ReceivablesClient({
  invoices: initialInvoices,
  accounts: initialAccounts,
  business,
}: {
  invoices: OpenInvoice[];
  accounts: ArAccount[];
  business: ReceiptBusiness;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialInvoices[0]?.id ?? null,
  );
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<
    "CASH" | "MPESA" | "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER"
  >("CASH");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return invoices;
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(s) ||
        i.customerName.toLowerCase().includes(s) ||
        (i.phone && i.phone.includes(s)),
    );
  }, [invoices, q]);

  const selected = invoices.find((i) => i.id === selectedId) ?? null;

  function selectInvoice(inv: OpenInvoice) {
    setSelectedId(inv.id);
    setAmount(String(inv.balanceDue));
    setReference("");
  }

  function collect() {
    if (!selected) {
      toast.error("Select an open invoice.");
      return;
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }
    start(async () => {
      const r = await receiveCreditPaymentAction({
        saleId: selected.id,
        amount: amt,
        method,
        reference: reference || null,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      setReceipt({
        invoiceNumber: r.invoice.invoiceNumber,
        soldAt: r.payment.paidAt,
        cashierName: null,
        customerName: selected.customerName,
        contactName: selected.contactName,
        customerPhone: selected.phone,
        paymentMethod: method,
        isCredit: r.invoice.balanceDue > 0.001,
        amountPaid: r.payment.amount,
        balanceDue: r.invoice.balanceDue,
        amountTendered: r.payment.amount,
        changeDue: 0,
        subtotal: r.invoice.total,
        total: r.invoice.total,
        notes: `Payment on credit invoice · remaining ${money(r.invoice.balanceDue)}`,
        lines: [
          {
            name: `Payment received (${method})`,
            quantity: 1,
            unitPrice: r.payment.amount,
            total: r.payment.amount,
          },
          {
            name: `Invoice ${r.invoice.invoiceNumber}`,
            quantity: 1,
            unitPrice: r.invoice.total,
            total: r.invoice.total,
          },
        ],
      });

      // Refresh local lists
      setInvoices((prev) =>
        prev
          .map((i) =>
            i.id === selected.id
              ? {
                  ...i,
                  amountPaid: r.invoice.amountPaid,
                  balanceDue: r.invoice.balanceDue,
                  paymentStatus: r.invoice.paymentStatus,
                }
              : i,
          )
          .filter((i) => i.balanceDue > 0.001),
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Credit collections
        </h1>
        <p className="text-sm text-muted-foreground">
          Receive payment on open credit invoices, print a receipt, and track
          customer balances.
        </p>
      </div>

      {/* Account balances summary */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
          Customer balances
        </h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary/50 text-left">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Open invoices</th>
                <th className="p-3 text-right">Invoiced</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3 text-right">Credit limit</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No open customer balances.
                  </td>
                </tr>
              ) : (
                accounts.map((a) => (
                  <tr key={a.customerId} className="border-t">
                    <td className="p-3 font-medium">{a.customerName}</td>
                    <td className="p-3 text-muted-foreground">
                      {a.phone ?? "—"}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {a.openInvoices}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(a.totalInvoiced)}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      {money(a.totalPaid)}
                    </td>
                    <td className="p-3 text-right font-semibold tabular-nums text-primary">
                      {money(a.balance)}
                    </td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">
                      {a.creditLimit > 0 ? money(a.creditLimit) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Open invoices */}
        <section className="space-y-3 lg:col-span-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Pending invoices
            </h2>
            <Input
              className="h-9 max-w-xs"
              placeholder="Search invoice, customer, phone…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No pending credit invoices.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      className={
                        "border-t " +
                        (selectedId === inv.id ? "bg-primary/10" : "")
                      }
                    >
                      <td className="p-3 font-mono text-xs font-medium">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3">
                        {inv.customerName}
                        {inv.phone ? (
                          <span className="block text-xs text-muted-foreground">
                            {inv.phone}
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 text-muted-foreground">{inv.soldAt}</td>
                      <td className="p-3 text-right font-semibold tabular-nums">
                        {money(inv.balanceDue)}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant={
                            selectedId === inv.id ? "default" : "outline"
                          }
                          onClick={() => selectInvoice(inv)}
                        >
                          Collect
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Collect form */}
        <section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Receive payment</h2>
          {selected ? (
            <>
              <div className="rounded-lg border bg-card p-3 text-sm">
                <p className="font-mono font-semibold">
                  {selected.invoiceNumber}
                </p>
                <p>{selected.customerName}</p>
                {selected.contactName ? (
                  <p className="text-xs text-muted-foreground">
                    Contact: {selected.contactName}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Invoice total {money(selected.total)} · Paid{" "}
                  {money(selected.amountPaid)}
                </p>
                <p className="text-lg font-bold text-primary">
                  Due {money(selected.balanceDue)}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Amount received</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Method</Label>
                <select
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value as typeof method)}
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CARD">Card</option>
                  <option value="MOBILE_MONEY">Mobile money</option>
                  <option value="BANK_TRANSFER">Bank transfer</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Reference (optional)</Label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="M-Pesa code / cheque no."
                />
              </div>
              <Button
                className="w-full"
                disabled={pending}
                onClick={collect}
              >
                {pending ? "Recording…" : "Record payment & print"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a pending invoice to collect payment.
            </p>
          )}
        </section>
      </div>

      {receipt ? (
        <SaleReceipt
          open={!!receipt}
          business={business}
          receipt={receipt}
          onClose={() => setReceipt(null)}
          autoPrint
        />
      ) : null}
    </div>
  );
}
