"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createSupplierInvoiceAction,
  paySupplierInvoiceAction,
} from "../../actions/supplier-invoice-ui";

type Inv = {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  status: string;
  total: string;
  balanceDue: string;
  currency: string;
  invoiceDate: Date | string;
};

export function SupplierInvoicesClient({
  invoices,
  suppliers,
}: {
  invoices: Inv[];
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [total, setTotal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [payId, setPayId] = useState("");
  const [payAmt, setPayAmt] = useState("");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Supplier invoices (AP)
        </h1>
        <p className="text-sm text-muted-foreground">
          True accounts payable — supplier bills, balances, and payments. Aging
          uses these balances.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h2 className="font-semibold">New supplier invoice</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <Label>Supplier</Label>
            <select
              className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Invoice #</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Total</Label>
            <Input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Due date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createSupplierInvoiceAction({
                supplierId,
                invoiceNumber,
                total: Number(total),
                dueDate: dueDate || null,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                setInvoiceNumber("");
                setTotal("");
                router.refresh();
              }
            })
          }
        >
          Record invoice
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border p-4">
        <h2 className="font-semibold">Record payment</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Invoice</Label>
            <select
              className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
              value={payId}
              onChange={(e) => setPayId(e.target.value)}
            >
              <option value="">Select…</option>
              {invoices
                .filter((i) => Number(i.balanceDue) > 0)
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.invoiceNumber} · due {i.balanceDue} {i.currency}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Amount</Label>
            <Input
              type="number"
              value={payAmt}
              onChange={(e) => setPayAmt(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending || !payId}
              onClick={() =>
                start(async () => {
                  const r = await paySupplierInvoiceAction({
                    invoiceId: payId,
                    amount: Number(payAmt),
                  });
                  if (!r.success) toast.error(r.message);
                  else {
                    toast.success(r.message);
                    setPayAmt("");
                    router.refresh();
                  }
                })
              }
            >
              Pay
            </Button>
          </div>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No supplier invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{i.invoiceNumber}</td>
                  <td className="p-3">{i.supplierName}</td>
                  <td className="p-3">
                    {new Date(i.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">{i.status}</td>
                  <td className="p-3 tabular-nums">
                    {i.total} {i.currency}
                  </td>
                  <td className="p-3 tabular-nums font-medium">
                    {i.balanceDue} {i.currency}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
