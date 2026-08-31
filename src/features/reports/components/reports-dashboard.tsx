"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";

export type ReportsOverviewData = {
  period: string;
  periodLabel: string;
  sales: {
    total: number;
    count: number;
    byDay: { day: string; total: number; count: number }[];
    topProducts: { productId: string; name: string; qty: number; revenue: number }[];
  };
  payments: {
    byMethod: { method: string; total: number; count: number }[];
  };
  finance: {
    expenses: number;
    otherIncome: number;
    netCash: number;
  };
  inventory: {
    onHandQty: number;
    lowStockCount: number;
    movements: { type: string; qty: number; count: number }[];
  };
  audit: {
    action: string;
    entity: string;
    description: string | null;
    createdAt: Date | string;
  }[];
};

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function money(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h];
          const s = v == null ? "" : String(v);
          return s.includes(",") || s.includes('"')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPdfPrint(title: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
      h1 { font-size: 18px; }
      table { border-collapse: collapse; width: 100%; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 12px; }
      th { background: #f3f4f6; }
    </style></head><body>
    <h1>${title}</h1>
    <p>Generated ${new Date().toLocaleString()}</p>
    ${document.getElementById("reports-print-area")?.innerHTML ?? ""}
    </body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
}

export function ReportsDashboard({ data }: { data: ReportsOverviewData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as "day" | "week" | "month") || data.period;

  function setPeriod(p: string) {
    router.push(`/reports?period=${p}`);
  }

  const financeChart = [
    { name: "Sales", value: data.sales.total },
    { name: "Other income", value: data.finance.otherIncome },
    { name: "Expenses", value: data.finance.expenses },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Business health for <strong>{data.periodLabel}</strong> — sales,
            stock, cash, and activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as const).map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
            >
              {p === "day" ? "Today" : p === "week" ? "7 days" : "This month"}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              downloadCsv(`sales-${data.periodLabel}.csv`, [
                ...data.sales.byDay.map((d) => ({
                  day: d.day,
                  sales_total: d.total,
                  invoices: d.count,
                })),
              ])
            }
          >
            Export Excel (CSV)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => exportPdfPrint(`GetAxe Reports — ${data.periodLabel}`)}
          >
            Print / PDF
          </Button>
        </div>
      </div>

      <div id="reports-print-area" className="space-y-6">
        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="Sales revenue" value={money(data.sales.total)} href="/reports/sales" />
          <Kpi title="Invoices" value={String(data.sales.count)} href="/reports/sales" />
          <Kpi
            title="Net cash (approx)"
            value={money(data.finance.netCash)}
            href="/reports/finance"
          />
          <Kpi
            title="Low stock items"
            value={String(data.inventory.lowStockCount)}
            href="/reports/inventory"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Sales trend" link="/reports/sales">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.sales.byDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(Number(v))} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Sales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Payments by method" link="/reports/finance">
            <div className="h-64">
              {data.payments.byMethod.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.payments.byMethod}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(props) => {
                        const method = String(
                          (props as { method?: string }).method ?? "",
                        );
                        const total = Number(
                          (props as { payload?: { total?: number } }).payload
                            ?.total ??
                            (props as { total?: number }).total ??
                            0,
                        );
                        return `${method}: ${money(total)}`;
                      }}
                    >
                      {data.payments.byMethod.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => money(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Top products by revenue" link="/reports/sales">
            <div className="h-64">
              {data.sales.topProducts.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sales.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip formatter={(v) => money(Number(v))} />
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Stock movements" link="/reports/inventory">
            <div className="h-64">
              {data.inventory.movements.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.inventory.movements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#8b5cf6" name="Quantity" />
                    <Bar dataKey="count" fill="#06b6d4" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Cash vs expenses" link="/reports/finance">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(Number(v))} />
                  <Bar dataKey="value" name="Amount">
                    {financeChart.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Audit activity" link="/reports/audit">
            <div className="max-h-64 overflow-y-auto">
              {data.audit.length === 0 ? (
                <Empty />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="p-1">When</th>
                      <th className="p-1">Action</th>
                      <th className="p-1">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit.map((a, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-1 whitespace-nowrap">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="p-1">
                          {a.action}/{a.entity}
                        </td>
                        <td className="p-1">{a.description ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="text-primary hover:underline" href="/reports/sales">
            Sales detail →
          </Link>
          <Link className="text-primary hover:underline" href="/reports/inventory">
            Inventory detail →
          </Link>
          <Link className="text-primary hover:underline" href="/reports/finance">
            Finance detail →
          </Link>
          <Link className="text-primary hover:underline" href="/reports/audit">
            Full audit trail →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40"
    >
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </Link>
  );
}

function ChartCard({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <Link href={link} className="text-xs text-primary hover:underline">
          Details
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      No data for this period
    </div>
  );
}
