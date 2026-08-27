"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createCashAccountAction,
  createExpenseAction,
  createIncomeAction,
  createTaxRateAction,
} from "../actions/finance-ui";

export function AccountsList({
  accounts,
}: {
  accounts: { id: string; accountCode: string; accountName: string; description?: string | null }[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chart of accounts</h1>
        <p className="text-sm text-muted-foreground">
          Ledger accounts used by products (income, COGS, inventory), cash accounts, and reports.
          Defaults are created automatically when empty.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-mono text-xs">{a.accountCode}</td>
                <td className="p-3 font-medium">{a.accountName}</td>
                <td className="p-3 text-muted-foreground">{a.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TaxRatesClient({
  rates,
}: {
  rates: { id: string; code: string; name: string; rate: string; isDefault: boolean }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("16");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tax rates</h1>
        <p className="text-sm text-muted-foreground">
          Selected on products (Product Wizard → Accounting) and applied on sales when tax is enabled.
        </p>
      </div>
      <div className="grid max-w-lg gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Code</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="VAT16" />
          </div>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="VAT 16%" />
          </div>
          <div className="space-y-1">
            <Label>Rate %</Label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createTaxRateAction({
                code,
                name,
                rate: Number(rate),
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Add tax rate
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Rate</th>
              <th className="p-3">Default</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono text-xs">{r.code}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.rate}%</td>
                <td className="p-3">{r.isDefault ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CashAccountsClient({
  accounts,
  ledgerAccounts,
}: {
  accounts: { id: string; name: string; type: string; currency: string }[];
  ledgerAccounts: { id: string; accountCode: string; accountName: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [type, setType] = useState("CASH");
  const [accountId, setAccountId] = useState(ledgerAccounts[0]?.id ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cash & bank accounts</h1>
        <p className="text-sm text-muted-foreground">
          POS payments, expenses, and other cash movements post against these drawers/accounts.
        </p>
      </div>
      <div className="grid max-w-lg gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Cash Drawer" />
        </div>
        <div className="space-y-1">
          <Label>Type</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {["CASH", "BANK", "MPESA", "MOBILE_MONEY", "PETTY_CASH"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Ledger account</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >
            {ledgerAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountCode} — {a.accountName}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          disabled={pending || !accountId}
          onClick={() =>
            start(async () => {
              const r = await createCashAccountAction({
                name,
                type: type as "CASH",
                accountId,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Add cash account
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Currency</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3">{a.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExpensesClient({
  expenses,
  categories,
  cashAccounts,
}: {
  expenses: { id: string; description: string; amount: string; status: string; expenseDate: string | Date }[];
  categories: { id: string; name: string }[];
  cashAccounts: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [cashAccountId, setCashAccountId] = useState(cashAccounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidTo, setPaidTo] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Operating costs paid from a cash/bank account (rent, utilities, salaries…).
        </p>
      </div>
      <div className="grid max-w-xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Paid from</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={cashAccountId}
              onChange={(e) => setCashAccountId(e.target.value)}
            >
              {cashAccounts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Amount</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Paid to</Label>
            <Input value={paidTo} onChange={(e) => setPaidTo(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createExpenseAction({
                categoryId,
                cashAccountId: cashAccountId || null,
                description,
                amount: Number(amount),
                paidTo: paidTo || null,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Record expense
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3 text-muted-foreground">
                  {new Date(e.expenseDate).toLocaleString()}
                </td>
                <td className="p-3">{e.description}</td>
                <td className="p-3 font-medium">{Number(e.amount).toLocaleString()}</td>
                <td className="p-3">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IncomesClient({
  incomes,
  categories,
  cashAccounts,
}: {
  incomes: { id: string; description: string; amount: string; status: string; incomeDate: string | Date }[];
  categories: { id: string; name: string }[];
  cashAccounts: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [cashAccountId, setCashAccountId] = useState(cashAccounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Other income</h1>
        <p className="text-sm text-muted-foreground">
          Non-POS income (service fees, refunds in, etc.). POS sales appear under Payments.
        </p>
      </div>
      <div className="grid max-w-xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Received into</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={cashAccountId}
              onChange={(e) => setCashAccountId(e.target.value)}
            >
              {cashAccounts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Amount</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Received from</Label>
            <Input value={receivedFrom} onChange={(e) => setReceivedFrom(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createIncomeAction({
                categoryId,
                cashAccountId: cashAccountId || null,
                description,
                amount: Number(amount),
                receivedFrom: receivedFrom || null,
              });
              if (!r.success) toast.error(r.message);
              else {
                toast.success(r.message);
                router.refresh();
              }
            })
          }
        >
          Record income
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3 text-muted-foreground">
                  {new Date(e.incomeDate).toLocaleString()}
                </td>
                <td className="p-3">{e.description}</td>
                <td className="p-3 font-medium">{Number(e.amount).toLocaleString()}</td>
                <td className="p-3">{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PaymentsList({
  payments,
}: {
  payments: {
    id: string;
    amount: string;
    method: string;
    status: string;
    paidAt: string | Date | null;
    invoiceNumber: string | null;
  }[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Customer payments from POS and sales invoices (linked to cash accounts when available).
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Method</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No payments yet. Complete a sale on POS to see them here.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 font-medium">{p.invoiceNumber ?? "—"}</td>
                  <td className="p-3">{p.method}</td>
                  <td className="p-3">{Number(p.amount).toLocaleString()}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-muted-foreground">
                    {p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}
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
