"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { formatDateTimeNairobi } from "@/lib/timezone";
import { EmptyState } from "@/components/shared";
import {
  createCashAccountAction,
  deactivateCashAccountAction,
  updateCashAccountDetailsAction,
  createChartAccountAction,
  updateChartAccountAction,
  createExpenseAction,
  createIncomeAction,
  createExpenseCategoryAction,
  createIncomeCategoryAction,
  createTaxRateAction,
  createRecurringExpenseAction,
  setRecurringExpenseActiveAction,
} from "../actions/finance-ui";

export function AccountsList({
  accounts,
  categories,
}: {
  accounts: {
    id: string;
    accountCode: string;
    accountName: string;
    description?: string | null;
    isSystem?: boolean;
    accountCategoryId?: string;
  }[];
  categories: { id: string; code: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accountCode, setAccountCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [description, setDescription] = useState("");
  const [accountCategoryId, setAccountCategoryId] = useState(
    categories.find((c) => c.code === "CA")?.id ?? categories[0]?.id ?? "",
  );

  const caCategoryId =
    categories.find((c) => c.code === "CA")?.id ?? categories[0]?.id ?? "";

  function resetForm() {
    setEditingId(null);
    setAccountCode("");
    setAccountName("");
    setDescription("");
    setAccountCategoryId(caCategoryId);
  }

  function startEdit(a: (typeof accounts)[number]) {
    setEditingId(a.id);
    setAccountCode(a.accountCode);
    setAccountName(a.accountName);
    setDescription(a.description ?? "");
    setAccountCategoryId(a.accountCategoryId ?? caCategoryId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Chart of accounts</h1>
        <p className="text-sm text-muted-foreground">
          Ledger used by cash tills, journals, and reports. Add extra bank or till ledgers
          (e.g. 1101 KCB, 1102 Equity) under Current Assets, then link them under{" "}
          <a href="/finance/cash-accounts" className="text-primary underline">
            Cash &amp; bank
          </a>
          . Use description for bank name, account number, or till / paybill.
        </p>
      </div>

      <div className="grid max-w-2xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium text-primary">
          {editingId ? "Edit ledger account" : "Add ledger account"}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Code</Label>
            <Input
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              placeholder="1101"
              disabled={Boolean(editingId && accounts.find((x) => x.id === editingId)?.isSystem)}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="KCB Current Account"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description (bank / till details)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="KCB · Acc 1234567890 · Branch Nairobi · or Till 554433"
          />
        </div>
        <div className="space-y-1">
          <Label>Category</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={accountCategoryId}
            onChange={(e) => setAccountCategoryId(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            Banks, cash, and mobile money ledgers usually use <strong>CA — Current Assets</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending || !accountName.trim() || !accountCode.trim() || !accountCategoryId}
            onClick={() =>
              start(async () => {
                if (editingId) {
                  const r = await updateChartAccountAction({
                    id: editingId,
                    accountCode: accountCode.trim(),
                    accountName: accountName.trim(),
                    description: description.trim() || null,
                    accountCategoryId,
                  });
                  if (!r.success) toast.error(r.message);
                  else {
                    toast.success(r.message);
                    resetForm();
                    router.refresh();
                  }
                  return;
                }
                const r = await createChartAccountAction({
                  accountCode: accountCode.trim(),
                  accountName: accountName.trim(),
                  accountCategoryId,
                  description: description.trim() || null,
                });
                if (!r.success) toast.error(r.message);
                else {
                  toast.success(r.message);
                  resetForm();
                  router.refresh();
                }
              })
            }
          >
            {editingId ? "Save changes" : "Add account"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" disabled={pending} onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-mono text-xs">{a.accountCode}</td>
                <td className="p-3 font-medium">
                  {a.accountName}
                  {a.isSystem ? (
                    <span className="ml-2 text-[10px] font-normal text-muted-foreground">
                      system
                    </span>
                  ) : null}
                </td>
                <td className="p-3 text-muted-foreground">{a.description ?? "—"}</td>
                <td className="p-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => startEdit(a)}
                  >
                    Edit
                  </Button>
                </td>
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
  accounts: {
    id: string;
    name: string;
    type: string;
    currency: string;
    openingBalance?: string;
    accountCode?: string;
    accountName?: string;
    accountId?: string;
    bankName?: string | null;
    accountNumber?: string | null;
    branchName?: string | null;
    movementIn?: number;
    movementOut?: number;
    currentBalance?: number;
  }[];
  ledgerAccounts: { id: string; accountCode: string; accountName: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("CASH");
  const [accountId, setAccountId] = useState(ledgerAccounts[0]?.id ?? "");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");

  function resetForm() {
    setEditingId(null);
    setName("");
    setType("CASH");
    setAccountId(ledgerAccounts[0]?.id ?? "");
    setBankName("");
    setAccountNumber("");
    setBranchName("");
  }

  function startEdit(a: (typeof accounts)[number]) {
    setEditingId(a.id);
    setName(a.name);
    setType(a.type);
    setAccountId(a.accountId ?? ledgerAccounts[0]?.id ?? "");
    setBankName(a.bankName ?? "");
    setAccountNumber(a.accountNumber ?? "");
    setBranchName(a.branchName ?? "");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cash & bank accounts</h1>
        <p className="text-sm text-muted-foreground">
          POS payments, expenses, and other cash movements post against these drawers/accounts.
          Add banks, M-Pesa tills, or card terminals here — they appear on POS when matching the payment type.
          Set starting till amounts under{" "}
          <a href="/finance/opening-balances" className="text-primary underline">
            Opening balances
          </a>
          .
        </p>
      </div>
      <div className="grid max-w-2xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        {editingId ? (
          <p className="text-sm font-medium text-primary">
            Editing account — update bank / till details, then save. Balances stay on the linked ledger.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            New tills (KCB, Equity, second M-Pesa till, etc.) are selectable on POS Bank / Mobile / Card once saved.
          </p>
        )}
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

        {(type === "BANK" || type === "MPESA" || type === "MOBILE_MONEY") && (
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {type === "BANK" ? "Bank name" : "Provider label"}
              </Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder={type === "BANK" ? "e.g. KCB, Equity" : "e.g. Safaricom"}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {type === "BANK" ? "Account number" : "Till / Paybill / Merchant"}
              </Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={type === "BANK" ? "Account no." : "Till or paybill"}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {type === "BANK" ? "Branch" : "Extra detail"}
              </Label>
              <Input
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder={type === "BANK" ? "Branch name" : "Optional"}
              />
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending || !accountId || !name.trim()}
            onClick={() =>
              start(async () => {
                if (editingId) {
                  const r = await updateCashAccountDetailsAction({
                    id: editingId,
                    name: name.trim(),
                    type: type as "CASH",
                    accountId,
                    bankName: bankName.trim() || null,
                    accountNumber: accountNumber.trim() || null,
                    branchName: branchName.trim() || null,
                  });
                  if (!r.success) toast.error(r.message);
                  else {
                    toast.success(r.message);
                    resetForm();
                    router.refresh();
                  }
                  return;
                }
                const r = await createCashAccountAction({
                  name: name.trim(),
                  type: type as "CASH",
                  accountId,
                  bankName: bankName.trim() || null,
                  accountNumber: accountNumber.trim() || null,
                  branchName: branchName.trim() || null,
                });
                if (!r.success) toast.error(r.message);
                else {
                  toast.success(r.message);
                  resetForm();
                  router.refresh();
                }
              })
            }
          >
            {editingId ? "Save changes" : "Add cash account"}
          </Button>
          {editingId ? (
            <Button type="button" variant="outline" disabled={pending} onClick={resetForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Bank / Till</th>
              <th className="p-3">Ledger</th>
              <th className="p-3 text-right">In (debits)</th>
              <th className="p-3 text-right">Out (credits)</th>
              <th className="p-3 text-right">Current balance</th>
              <th className="p-3 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {[a.bankName, a.accountNumber, a.branchName]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {a.accountCode ? `${a.accountCode} · ${a.accountName ?? ""}` : "—"}
                </td>
                <td className="p-3 text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                  {(a.movementIn ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right tabular-nums text-red-700 dark:text-red-400">
                  {(a.movementOut ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-right tabular-nums font-semibold">
                  {(a.currentBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                  {a.currency}
                </td>
                                <td className="p-3 text-right whitespace-nowrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => startEdit(a)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={pending}
                    onClick={() => {
                      if (
                        !confirm(
                          `Remove "${a.name}" from active cash & bank list?\n\nPast journals stay on the ledger. You can add a fresh account with the correct bank details afterward.`,
                        )
                      ) {
                        return;
                      }
                      start(async () => {
                        const r = await deactivateCashAccountAction({ id: a.id });
                        if (!r.success) toast.error(r.message);
                        else {
                          toast.success(r.message);
                          if (editingId === a.id) resetForm();
                          router.refresh();
                        }
                      });
                    }}
                  >
                    Remove
                  </Button>
                </td>

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
  recurring = [],
}: {
  expenses: { id: string; description: string; amount: string; status: string; expenseDate: string | Date }[];
  categories: { id: string; name: string }[];
  cashAccounts: { id: string; name: string }[];
  recurring?: {
    id: string;
    name: string;
    amount: number;
    dayOfMonth: number;
    notes: string | null;
    active: boolean;
    categoryId: string;
    categoryName: string;
  }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [catList, setCatList] = useState(categories);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [cashAccountId, setCashAccountId] = useState(cashAccounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidTo, setPaidTo] = useState("");

  const [recCatId, setRecCatId] = useState(categories[0]?.id ?? "");
  const [recName, setRecName] = useState("");
  const [recAmount, setRecAmount] = useState("");
  const [recDay, setRecDay] = useState("1");

  const monthlyFixed = recurring
    .filter((r) => r.active)
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          Record payments as they happen, and set monthly fixed costs (rent, salaries,
          utilities…) so the dashboard shows how sales cover those obligations.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Monthly fixed costs</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Anticipated recurring amounts. These feed the dashboard &quot;Expenses · next 30
              days&quot; card and your break-even progress. They are not cash outflows until you
              record a paid expense below.
            </p>
            {monthlyFixed > 0 ? (
              <p className="mt-1 text-sm font-semibold text-foreground">
                Active monthly total:{" "}
                {monthlyFixed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid max-w-2xl gap-3 rounded-lg border bg-card p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Category</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={recCatId}
                onChange={(e) => setRecCatId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Due day of month (1–28)</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={recDay}
                onChange={(e) => setRecDay(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="Shop rent, salaries, power…"
                value={recName}
                onChange={(e) => setRecName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Monthly amount</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={recAmount}
                onChange={(e) => setRecAmount(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="button"
            disabled={pending || !recName.trim() || !recAmount}
            onClick={() =>
              start(async () => {
                const r = await createRecurringExpenseAction({
                  categoryId: recCatId,
                  name: recName,
                  amount: Number(recAmount),
                  dayOfMonth: Number(recDay),
                });
                if (!r.success) toast.error(r.message);
                else {
                  toast.success(r.message);
                  setRecName("");
                  setRecAmount("");
                  router.refresh();
                }
              })
            }
          >
            Add monthly fixed cost
          </Button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Category</th>
                <th className="p-2">Due day</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {recurring.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-muted-foreground">
                    No fixed costs yet — add rent, salaries, transport, utilities…
                  </td>
                </tr>
              ) : (
                recurring.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 font-medium">{r.name}</td>
                    <td className="p-2 text-muted-foreground">{r.categoryName}</td>
                    <td className="p-2">{r.dayOfMonth}</td>
                    <td className="p-2 text-right tabular-nums font-medium">
                      {Number(r.amount).toLocaleString()}
                    </td>
                    <td className="p-2">
                      {r.active ? (
                        <span className="text-xs text-emerald-600">Active</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Paused</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const res = await setRecurringExpenseActiveAction(
                              r.id,
                              !r.active,
                            );
                            if (!res.success) toast.error(res.message);
                            else {
                              toast.success(res.message);
                              router.refresh();
                            }
                          })
                        }
                      >
                        {r.active ? "Pause" : "Resume"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div>
        <h2 className="text-lg font-semibold">Record a payment</h2>
        <p className="text-sm text-muted-foreground">
          Cash leaves the drawer/bank when you record here (posts to accounts).
        </p>
      </div>
      <div className="grid max-w-xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") {
                  setShowNewCat(true);
                  return;
                }
                setShowNewCat(false);
                setCategoryId(v);
              }}
            >
              {catList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ Create new category…</option>
            </select>
            {showNewCat ? (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || !newCatName.trim()}
                  onClick={() =>
                    start(async () => {
                      const r = await createExpenseCategoryAction({
                        name: newCatName.trim(),
                      });
                      if (!r.success) {
                        toast.error(r.message);
                        return;
                      }
                      toast.success(r.message);
                      setCatList((prev) => {
                        if (prev.some((c) => c.id === r.id)) return prev;
                        return [...prev, { id: r.id, name: r.name }].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        );
                      });
                      setCategoryId(r.id);
                      setRecCatId((id) => id || r.id);
                      setNewCatName("");
                      setShowNewCat(false);
                      router.refresh();
                    })
                  }
                >
                  Save
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Pick a type, or create one if it is missing (Other is available).
              </p>
            )}
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
      {expenses.length === 0 ? (
        <EmptyState
          title="No expenses recorded yet"
          description="Record rent, salaries, utilities and other costs so profit against fixed costs is clear."
        />
      ) : (
        <>
          <ul className="grid gap-3 md:hidden">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{e.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTimeNairobi(e.expenseDate)} · {e.status}
                    </p>
                  </div>
                  <p className="shrink-0 text-base font-semibold tabular-nums">
                    {Number(e.amount).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-xl border md:block">
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
                      {formatDateTimeNairobi(e.expenseDate)}
                    </td>
                    <td className="p-3">{e.description}</td>
                    <td className="p-3 font-medium">
                      {Number(e.amount).toLocaleString()}
                    </td>
                    <td className="p-3">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
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
  const [catList, setCatList] = useState(categories);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [newCatName, setNewCatName] = useState("");
  const [showNewCat, setShowNewCat] = useState(false);
  const [cashAccountId, setCashAccountId] = useState(cashAccounts[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedFrom, setReceivedFrom] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Other income</h1>
        <p className="text-sm text-muted-foreground">
          Non-POS income (service fees, commissions, refunds…). Till sales stay under Payments.
        </p>
      </div>
      <div className="grid max-w-xl gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Category</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryId}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__new__") {
                  setShowNewCat(true);
                  return;
                }
                setShowNewCat(false);
                setCategoryId(v);
              }}
            >
              {catList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">+ Create new category…</option>
            </select>
            {showNewCat ? (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="h-9"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={pending || !newCatName.trim()}
                  onClick={() =>
                    start(async () => {
                      const r = await createIncomeCategoryAction({
                        name: newCatName.trim(),
                      });
                      if (!r.success) {
                        toast.error(r.message);
                        return;
                      }
                      toast.success(r.message);
                      setCatList((prev) => {
                        if (prev.some((c) => c.id === r.id)) return prev;
                        return [...prev, { id: r.id, name: r.name }].sort((a, b) =>
                          a.name.localeCompare(b.name),
                        );
                      });
                      setCategoryId(r.id);
                      setNewCatName("");
                      setShowNewCat(false);
                      router.refresh();
                    })
                  }
                >
                  Save
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Pick a type, or create one if it is missing (Other is available).
              </p>
            )}
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
                  {formatDateTimeNairobi(e.incomeDate)}
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
                    {p.paidAt ? formatDateTimeNairobi(p.paidAt) : "—"}
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
