"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getOpeningBalancesStateAction,
  saveOpeningCashBalancesAction,
} from "../actions/opening-balances";

type AccountRow = {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalance: number;
};

export function OpeningBalancesClient() {
  const [pending, start] = useTransition();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [hasStock, setHasStock] = useState(false);
  const [hasJournals, setHasJournals] = useState(false);

  function load() {
    start(async () => {
      const r = await getOpeningBalancesStateAction();
      if (!r.success) return;
      setAccounts(r.data.accounts);
      setHasStock(r.data.hasStockOnHand);
      setHasJournals(r.data.hasOpeningJournals);
      const map: Record<string, string> = {};
      for (const a of r.data.accounts) {
        map[a.id] = String(a.openingBalance || "");
      }
      setAmounts(map);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    start(async () => {
      const lines = accounts.map((a) => ({
        cashAccountId: a.id,
        openingBalance: Number(amounts[a.id] || 0),
      }));
      const r = await saveOpeningCashBalancesAction({
        lines,
        postJournal: true,
      });
      if (!r.success) toast.error(r.message);
      else {
        toast.success(r.message);
        load();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Opening balances
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Use this once when an <strong>existing</strong> business goes live on
          GetAxe. Record cash already in tills and load stock you already own.
          Do <strong>not</strong> create a purchase order for stock you already
          paid for — that would create a false supplier debt.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="font-semibold">New business</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Leave opening cash at 0 (or put seed capital here).</li>
            <li>Create products.</li>
            <li>
              Buy stock via <strong>Purchases → Orders → Receiving</strong>.
            </li>
            <li>
              Pay suppliers under <strong>Supplier invoices</strong>.
            </li>
            <li>Sell on POS.</li>
          </ol>
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <h2 className="font-semibold">Existing business</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Set real till / M-Pesa / bank opening cash below.</li>
            <li>
              Load owned stock via{" "}
              <Link
                href="/inventory/stock"
                className="font-medium text-primary underline"
              >
                Opening stock import
              </Link>{" "}
              or Stock receive → type <strong>Opening stock</strong>.
            </li>
            <li>Only use PO/GRN for new unpaid supplier deliveries.</li>
            <li>Then POS, expenses, reconciliation, reports.</li>
          </ol>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Opening cash</h2>
        <p className="text-sm text-muted-foreground">
          Amounts already held before first GetAxe sale. Saving posts{" "}
          <strong>Dr Cash / Cr Owner equity</strong> for increases so the balance
          sheet stays truthful.
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm">
            No cash accounts yet.{" "}
            <Link href="/finance/cash-accounts" className="text-primary underline">
              Create tills first
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3">Account</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Opening balance (KES)</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">{a.type}</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="max-w-[160px]"
                        value={amounts[a.id] ?? ""}
                        onChange={(e) =>
                          setAmounts((m) => ({
                            ...m,
                            [a.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Button type="button" disabled={pending || accounts.length === 0} onClick={save}>
          {pending ? "Saving…" : "Save opening cash"}
        </Button>
        {hasJournals ? (
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Opening balance journals are on file under Finance → Journals.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Opening stock (owned inventory)</h2>
        <p className="text-sm text-muted-foreground">
          Physical stock you already own. Use cost per <strong>stock unit</strong>{" "}
          (tablet/piece). The system posts{" "}
          <strong>Dr Inventory / Cr Owner equity</strong> on opening receive.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/inventory/stock"
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Stock on hand / import opening
          </Link>
          <Link
            href="/inventory/stock/receive"
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Receive (Opening stock type)
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Status:{" "}
          {hasStock
            ? "Stock on hand exists — verify costs and quantities."
            : "No stock yet — import or receive opening stock before selling."}
        </p>
      </section>

      <section className="space-y-2 rounded-xl border p-4 text-sm">
        <h2 className="font-semibold">3. After opening — normal operations</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <Link href="/purchases/orders" className="text-primary underline">
              Purchase orders → Receiving
            </Link>{" "}
            for new supplier goods (creates AP).
          </li>
          <li>
            <Link
              href="/purchases/supplier-invoices"
              className="text-primary underline"
            >
              Supplier invoices → Pay
            </Link>{" "}
            when you pay the supplier.
          </li>
          <li>
            <Link href="/sales/pos" className="text-primary underline">
              POS
            </Link>{" "}
            for sales; credit collections for unpaid invoices.
          </li>
          <li>
            <Link href="/finance/reconciliation" className="text-primary underline">
              Daily reconciliation
            </Link>{" "}
            then{" "}
            <Link href="/reports/finance" className="text-primary underline">
              Financial reports
            </Link>
            .
          </li>
        </ul>
      </section>
    </div>
  );
}
