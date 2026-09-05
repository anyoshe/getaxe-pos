"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getCashReconciliationDayOverviewAction,
  getCashReconciliationSummaryAction,
  saveCashReconciliationAction,
} from "../actions/cash-reconciliation";

type Account = {
  id: string;
  name: string;
  type: string;
  currency: string;
};

type HistoryRow = {
  id: string;
  reconciliationDate: string;
  accountName: string;
  accountType: string;
  openingBalance: string;
  systemInflows: string;
  systemOutflows: string;
  expectedBalance: string;
  countedBalance: string;
  difference: string;
};

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CashReconciliationClient({
  accounts,
  history,
}: {
  accounts: Account[];
  history: HistoryRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [cashAccountId, setCashAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(todayNairobi());
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState<{
    openingBalance: number;
    systemInflows: number;
    systemOutflows: number;
    expectedBalance: number;
    paymentInflows: number;
    otherInflows: number;
  } | null>(null);
  const [overview, setOverview] = useState<
    Array<{
      cashAccountId: string;
      name: string;
      type: string;
      paymentInflows: number;
      systemInflows: number;
      systemOutflows: number;
      expectedBalance: number;
    }>
  >([]);

  const selected = useMemo(
    () => accounts.find((a) => a.id === cashAccountId),
    [accounts, cashAccountId],
  );

  function loadOverview() {
    if (!date) return;
    start(async () => {
      const r = await getCashReconciliationDayOverviewAction({ date });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setOverview(r.rows);
    });
  }

  function loadSummary() {
    if (!cashAccountId || !date) return;
    start(async () => {
      const r = await getCashReconciliationSummaryAction({
        cashAccountId,
        date,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      setSummary({
        openingBalance: r.summary.openingBalance,
        systemInflows: r.summary.systemInflows,
        systemOutflows: r.summary.systemOutflows,
        expectedBalance: r.summary.expectedBalance,
        paymentInflows: r.summary.paymentInflows,
        otherInflows: r.summary.otherInflows,
      });
      setCounted(String(r.summary.expectedBalance));
    });
  }

  function save() {
    start(async () => {
      const r = await saveCashReconciliationAction({
        cashAccountId,
        reconciliationDate: date,
        countedBalance: Number(counted),
        notes: notes || null,
      });
      if (!r.success) {
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      router.refresh();
    });
  }

  const diff =
    summary && counted !== ""
      ? Number(counted) - summary.expectedBalance
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Daily reconciliation
        </h1>
        <p className="text-sm text-muted-foreground">
          Reconcile each tender channel used at POS — cash drawer, M-Pesa,
          mobile money, card terminal, and bank. System totals come from POS
          payments (by method), other income, and expenses for the day.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">All channels — {date}</h2>
            <p className="text-xs text-muted-foreground">
              POS sales by payment method land on the matching till for
              end-of-day count.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={loadOverview}
          >
            Refresh day totals
          </Button>
        </div>
        {overview.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-secondary/40 text-left">
                <tr>
                  <th className="p-2">Channel</th>
                  <th className="p-2">Type</th>
                  <th className="p-2 text-right">POS inflows</th>
                  <th className="p-2 text-right">Total in</th>
                  <th className="p-2 text-right">Out</th>
                  <th className="p-2 text-right">Expected</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {overview.map((row) => (
                  <tr key={row.cashAccountId} className="border-t">
                    <td className="p-2 font-medium">{row.name}</td>
                    <td className="p-2 text-muted-foreground">{row.type}</td>
                    <td className="p-2 text-right tabular-nums">
                      {money(row.paymentInflows)}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {money(row.systemInflows)}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {money(row.systemOutflows)}
                    </td>
                    <td className="p-2 text-right font-semibold tabular-nums">
                      {money(row.expectedBalance)}
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCashAccountId(row.cashAccountId);
                          setSummary(null);
                          setTimeout(() => loadSummary(), 0);
                        }}
                      >
                        Count
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Click <strong>Refresh day totals</strong> to load Cash, M-Pesa,
            Card, Bank and Mobile Money for this date.
          </p>
        )}
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          No cash accounts yet. Create drawers under Finance → Cash &amp; bank
          first (Main Cash, M-Pesa Till, Bank…).
        </p>
      ) : (
        <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Cash / bank / mobile account</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cashAccountId}
                onChange={(e) => {
                  setCashAccountId(e.target.value);
                  setSummary(null);
                }}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Business date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSummary(null);
                }}
              />
            </div>
            <div className="flex items-end">
              <Button type="button" variant="outline" disabled={pending} onClick={loadSummary}>
                {pending ? "Loading…" : "Load system totals"}
              </Button>
            </div>
          </div>

          {selected ? (
            <p className="text-xs text-muted-foreground">
              This channel counts POS payments with method:{" "}
              <strong>
                {selected.type === "CASH"
                  ? "CASH"
                  : selected.type === "MPESA"
                    ? "MPESA"
                    : selected.type === "MOBILE_MONEY"
                      ? "MOBILE_MONEY"
                      : selected.name.toLowerCase().includes("card")
                        ? "CARD"
                        : "BANK_TRANSFER / CHEQUE"}
              </strong>
            </p>
          ) : null}

          {summary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-3 text-sm">
                <div className="text-xs text-muted-foreground">Opening</div>
                <div className="text-lg font-semibold tabular-nums">
                  {money(summary.openingBalance)}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-sm">
                <div className="text-xs text-muted-foreground">
                  Inflows (POS {money(summary.paymentInflows)} + other{" "}
                  {money(summary.otherInflows)})
                </div>
                <div className="text-lg font-semibold tabular-nums text-primary">
                  +{money(summary.systemInflows)}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-sm">
                <div className="text-xs text-muted-foreground">Outflows (expenses)</div>
                <div className="text-lg font-semibold tabular-nums">
                  −{money(summary.systemOutflows)}
                </div>
              </div>
              <div className="rounded-lg border bg-card p-3 text-sm">
                <div className="text-xs text-muted-foreground">Expected close</div>
                <div className="text-lg font-semibold tabular-nums">
                  {money(summary.expectedBalance)}
                </div>
              </div>
            </div>
          )}

          {selected ? (
            <p className="text-xs text-muted-foreground">
              This channel counts POS payments with method:{" "}
              <strong>
                {selected.type === "CASH"
                  ? "CASH"
                  : selected.type === "MPESA"
                    ? "MPESA"
                    : selected.type === "MOBILE_MONEY"
                      ? "MOBILE_MONEY"
                      : selected.name.toLowerCase().includes("card")
                        ? "CARD"
                        : "BANK_TRANSFER / CHEQUE"}
              </strong>
            </p>
          ) : null}

          {summary && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>
                  Counted / statement balance ({selected?.currency ?? "KES"})
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                />
                {diff != null && (
                  <p
                    className={
                      Math.abs(diff) < 0.01
                        ? "text-xs text-muted-foreground"
                        : "text-xs text-destructive"
                    }
                  >
                    Difference: {money(diff)}{" "}
                    {Math.abs(diff) < 0.01 ? "(balanced)" : "(investigate)"}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Shift, variance reason…"
                />
              </div>
            </div>
          )}

          {selected ? (
            <p className="text-xs text-muted-foreground">
              This channel counts POS payments with method:{" "}
              <strong>
                {selected.type === "CASH"
                  ? "CASH"
                  : selected.type === "MPESA"
                    ? "MPESA"
                    : selected.type === "MOBILE_MONEY"
                      ? "MOBILE_MONEY"
                      : selected.name.toLowerCase().includes("card")
                        ? "CARD"
                        : "BANK_TRANSFER / CHEQUE"}
              </strong>
            </p>
          ) : null}

          {summary && (
            <Button type="button" disabled={pending || counted === ""} onClick={save}>
              {pending ? "Saving…" : "Save reconciliation"}
            </Button>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-2 text-lg font-semibold">Recent reconciliations</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Account</th>
                <th className="p-3">Expected</th>
                <th className="p-3">Counted</th>
                <th className="p-3">Difference</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No reconciliations saved yet.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="p-3">{h.reconciliationDate}</td>
                    <td className="p-3">
                      {h.accountName}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({h.accountType})
                      </span>
                    </td>
                    <td className="p-3 tabular-nums">
                      {Number(h.expectedBalance).toLocaleString()}
                    </td>
                    <td className="p-3 tabular-nums">
                      {Number(h.countedBalance).toLocaleString()}
                    </td>
                    <td
                      className={
                        Math.abs(Number(h.difference)) < 0.01
                          ? "p-3 tabular-nums text-muted-foreground"
                          : "p-3 tabular-nums text-destructive"
                      }
                    >
                      {Number(h.difference).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
