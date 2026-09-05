"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadXlsx } from "@/lib/spreadsheet";
import {
  getAssetsLiabilitiesAction,
  getBalanceSheetAction,
  getExpenseReportAction,
  getProfitAndLossAction,
} from "../actions/financial-statements";

type Tab = "expenses" | "pl" | "balance" | "assets";

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

function printArea(id: string, title: string) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) {
    toast.error("Allow pop-ups for PDF.");
    return;
  }
  const body = document.getElementById(id)?.innerHTML ?? "";
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:16px;color:#000;font-size:12px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #ccc;padding:5px 8px;text-align:left}
      th{background:#f3f4f6}
      .num{text-align:right}
      h1,h2,h3{margin:8px 0}
    </style></head><body>${body}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

export function FinancialReportsClient() {
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<Tab>("pl");
  const [fromDate, setFromDate] = useState(todayNairobi().slice(0, 8) + "01");
  const [toDate, setToDate] = useState(todayNairobi());
  const [asOfDate, setAsOfDate] = useState(todayNairobi());

  const [expenseData, setExpenseData] = useState<Awaited<
    ReturnType<typeof getExpenseReportAction>
  > | null>(null);
  const [plData, setPlData] = useState<Awaited<
    ReturnType<typeof getProfitAndLossAction>
  > | null>(null);
  const [bsData, setBsData] = useState<Awaited<
    ReturnType<typeof getBalanceSheetAction>
  > | null>(null);
  const [alData, setAlData] = useState<Awaited<
    ReturnType<typeof getAssetsLiabilitiesAction>
  > | null>(null);

  function run() {
    start(async () => {
      if (tab === "expenses") {
        const r = await getExpenseReportAction({ fromDate, toDate });
        if (!r.success) return toast.error(r.message);
        setExpenseData(r);
        toast.success("Expense report ready");
      } else if (tab === "pl") {
        const r = await getProfitAndLossAction({ fromDate, toDate });
        if (!r.success) return toast.error(r.message);
        setPlData(r);
        toast.success("P&L ready");
      } else if (tab === "balance") {
        const r = await getBalanceSheetAction({ asOfDate });
        if (!r.success) return toast.error(r.message);
        setBsData(r);
        toast.success("Balance sheet ready");
      } else {
        const r = await getAssetsLiabilitiesAction({ asOfDate });
        if (!r.success) return toast.error(r.message);
        setAlData(r);
        toast.success("Assets & liabilities ready");
      }
    });
  }

  function exportExcel() {
    if (tab === "expenses" && expenseData?.success) {
      downloadXlsx(
        `expenses-${fromDate}-to-${toDate}.xlsx`,
        "Expenses",
        expenseData.data.lines.map((l) => ({
          Date: l.date,
          Category: l.categoryName,
          Description: l.description,
          Amount: l.amount,
          Status: l.status,
          "Paid to": l.paidTo ?? "",
          Reference: l.reference ?? "",
        })),
      );
    } else if (tab === "pl" && plData?.success) {
      const rows: Array<Record<string, string | number>> = [];
      rows.push({ Section: "Revenue", Account: "Total", Amount: plData.data.revenue.total });
      for (const l of plData.data.revenue.lines) {
        rows.push({
          Section: "Revenue",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({ Section: "COGS", Account: "Total", Amount: plData.data.cogs.total });
      for (const l of plData.data.cogs.lines) {
        rows.push({
          Section: "COGS",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({
        Section: "Gross profit",
        Account: "",
        Amount: plData.data.grossProfit,
      });
      rows.push({
        Section: "Operating expenses",
        Account: "Total",
        Amount: plData.data.operatingExpenses.total,
      });
      for (const l of plData.data.operatingExpenses.lines) {
        rows.push({
          Section: "OPEX",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({
        Section: "Net profit",
        Account: "",
        Amount: plData.data.netProfit,
      });
      downloadXlsx(`profit-and-loss-${fromDate}-to-${toDate}.xlsx`, "PnL", rows);
    } else if (tab === "balance" && bsData?.success) {
      const rows: Array<Record<string, string | number>> = [];
      for (const l of bsData.data.assets.lines) {
        rows.push({
          Section: "Assets",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({ Section: "Assets", Account: "TOTAL", Amount: bsData.data.assets.total });
      for (const l of bsData.data.liabilities.lines) {
        rows.push({
          Section: "Liabilities",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({
        Section: "Liabilities",
        Account: "TOTAL",
        Amount: bsData.data.liabilities.total,
      });
      for (const l of bsData.data.equity.lines) {
        rows.push({
          Section: "Equity",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({
        Section: "Equity",
        Account: "Retained earnings (YTD)",
        Amount: bsData.data.equity.retainedEarnings,
      });
      rows.push({
        Section: "Equity",
        Account: "TOTAL",
        Amount: bsData.data.equity.total,
      });
      downloadXlsx(`balance-sheet-${asOfDate}.xlsx`, "BalanceSheet", rows);
    } else if (tab === "assets" && alData?.success) {
      const rows: Array<Record<string, string | number>> = [];
      for (const l of alData.data.assets.lines) {
        rows.push({
          Type: "Asset",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      for (const l of alData.data.liabilities.lines) {
        rows.push({
          Type: "Liability",
          Account: `${l.accountCode} ${l.accountName}`,
          Amount: l.balance,
        });
      }
      rows.push({ Type: "Net assets", Account: "", Amount: alData.data.netAssets });
      downloadXlsx(`assets-liabilities-${asOfDate}.xlsx`, "AL", rows);
    } else {
      toast.error("Run the report first.");
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "pl", label: "Profit & loss" },
    { id: "expenses", label: "Expenses" },
    { id: "balance", label: "Balance sheet" },
    { id: "assets", label: "Assets & liabilities" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Accountant packs: expenses, P&amp;L, balance sheet, assets &amp;
          liabilities — from journals and operational ledgers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant={tab === t.id ? "default" : "outline"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        {tab === "expenses" || tab === "pl" ? (
          <>
            <div className="space-y-1">
              <Label>From</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <Label>As at</Label>
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </div>
        )}
        <Button type="button" disabled={pending} onClick={run}>
          {pending ? "Loading…" : "Run report"}
        </Button>
        <Button type="button" variant="outline" onClick={exportExcel}>
          Excel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            printArea(
              "finance-report-print",
              tab === "pl"
                ? "Profit & Loss"
                : tab === "expenses"
                  ? "Expenses"
                  : tab === "balance"
                    ? "Balance Sheet"
                    : "Assets & Liabilities",
            )
          }
        >
          PDF
        </Button>
      </div>

      <div id="finance-report-print" className="space-y-4">
        {tab === "expenses" && expenseData?.success ? (
          <ExpenseView data={expenseData.data} />
        ) : null}
        {tab === "pl" && plData?.success ? (
          <PlView data={plData.data} />
        ) : null}
        {tab === "balance" && bsData?.success ? (
          <BsView data={bsData.data} />
        ) : null}
        {tab === "assets" && alData?.success ? (
          <AlView data={alData.data} />
        ) : null}
        {!expenseData && !plData && !bsData && !alData ? (
          <p className="text-sm text-muted-foreground">
            Choose a report tab, set dates, then <strong>Run report</strong>.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

function ExpenseView({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getExpenseReportAction>>,
    { success: true }
  >["data"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>
        Expense report {data.fromDate} → {data.toDate}
      </SectionTitle>
      <p className="text-sm">
        Total expenses: <strong>KES {money(data.total)}</strong>
      </p>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3 text-right">Count</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.byCategory.map((c) => (
              <tr key={c.categoryName} className="border-t">
                <td className="p-3">{c.categoryName}</td>
                <td className="p-3 text-right tabular-nums">{c.count}</td>
                <td className="p-3 text-right tabular-nums">{money(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Category</th>
              <th className="p-3">Description</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No expenses in this period.
                </td>
              </tr>
            ) : (
              data.lines.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{l.date}</td>
                  <td className="p-3">{l.categoryName}</td>
                  <td className="p-3">{l.description}</td>
                  <td className="p-3 text-right tabular-nums">{money(l.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlView({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getProfitAndLossAction>>,
    { success: true }
  >["data"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>
        Profit &amp; loss {data.fromDate} → {data.toDate}
      </SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Revenue" value={`KES ${money(data.revenue.total)}`} />
        <Kpi label="Gross profit" value={`KES ${money(data.grossProfit)}`} />
        <Kpi label="Net profit" value={`KES ${money(data.netProfit)}`} />
      </div>
      <AccountBlock title="Revenue" total={data.revenue.total} lines={data.revenue.lines} />
      {data.revenue.salesTotal > 0 ? (
        <p className="text-xs text-muted-foreground">
          Includes completed sales KES {money(data.revenue.salesTotal)}
          {data.revenue.otherIncome > 0
            ? ` + other income KES ${money(data.revenue.otherIncome)}`
            : ""}
        </p>
      ) : null}
      <AccountBlock title="Cost of goods sold" total={data.cogs.total} lines={data.cogs.lines} />
      <p className="font-semibold">
        Gross profit: KES {money(data.grossProfit)}
      </p>
      <AccountBlock
        title="Operating expenses"
        total={data.operatingExpenses.total}
        lines={data.operatingExpenses.lines}
      />
      <p className="text-lg font-bold text-primary">
        Net profit / (loss): KES {money(data.netProfit)}
      </p>
    </div>
  );
}

function BsView({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getBalanceSheetAction>>,
    { success: true }
  >["data"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Balance sheet as at {data.asOfDate}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Total assets" value={`KES ${money(data.assets.total)}`} />
        <Kpi
          label="Total liabilities"
          value={`KES ${money(data.liabilities.total)}`}
        />
        <Kpi label="Equity" value={`KES ${money(data.equity.total)}`} />
      </div>
      <AccountBlock title="Assets" total={data.assets.total} lines={data.assets.lines} />
      <AccountBlock
        title="Liabilities"
        total={data.liabilities.total}
        lines={data.liabilities.lines}
      />
      <div className="rounded-xl border p-4 text-sm">
        <p className="font-semibold">Equity</p>
        {data.equity.lines.map((l) => (
          <div key={l.accountId} className="flex justify-between border-t py-1">
            <span>
              {l.accountCode} {l.accountName}
            </span>
            <span className="tabular-nums">{money(l.balance)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t py-1">
          <span>Retained earnings (incl. YTD P&amp;L)</span>
          <span className="tabular-nums">
            {money(data.equity.retainedEarnings)}
          </span>
        </div>
        <div className="flex justify-between border-t py-2 font-semibold">
          <span>Total equity</span>
          <span className="tabular-nums">{money(data.equity.total)}</span>
        </div>
      </div>
      <p className="text-sm">
        Total liabilities &amp; equity:{" "}
        <strong>KES {money(data.totalLiabilitiesAndEquity)}</strong>
        {!data.balanced ? (
          <span className="ml-2 text-amber-700">
            (Difference KES {money(data.difference)} — journals may still be
            posting)
          </span>
        ) : (
          <span className="ml-2 text-emerald-700">Balanced</span>
        )}
      </p>
    </div>
  );
}

function AlView({
  data,
}: {
  data: Extract<
    Awaited<ReturnType<typeof getAssetsLiabilitiesAction>>,
    { success: true }
  >["data"];
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Assets &amp; liabilities as at {data.asOfDate}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Assets" value={`KES ${money(data.assets.total)}`} />
        <Kpi label="Liabilities" value={`KES ${money(data.liabilities.total)}`} />
        <Kpi label="Net assets" value={`KES ${money(data.netAssets)}`} />
      </div>
      <AccountBlock title="Assets" total={data.assets.total} lines={data.assets.lines} />
      <AccountBlock
        title="Liabilities"
        total={data.liabilities.total}
        lines={data.liabilities.lines}
      />
    </div>
  );
}

function AccountBlock({
  title,
  total,
  lines,
}: {
  title: string;
  total: number;
  lines: Array<{
    accountId: string;
    accountCode: string;
    accountName: string;
    balance: number;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <div className="border-b bg-secondary/40 px-3 py-2 text-sm font-semibold">
        {title}{" "}
        <span className="float-right tabular-nums">KES {money(total)}</span>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td className="p-4 text-muted-foreground">No balances yet.</td>
            </tr>
          ) : (
            lines.map((l) => (
              <tr key={l.accountId} className="border-t">
                <td className="p-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {l.accountCode}
                  </span>{" "}
                  {l.accountName}
                </td>
                <td className="p-3 text-right tabular-nums">{money(l.balance)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
