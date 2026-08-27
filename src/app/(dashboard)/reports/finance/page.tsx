import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { reportsOverviewService } from "@/features/reports/services/reports-overview.service";

export default async function FinanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const sp = await searchParams;
  const period =
    sp.period === "week" || sp.period === "month" ? sp.period : "day";
  const data = await reportsOverviewService.getOverview(user.businessId, period);
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-4">
      <Link href={`/reports?period=${period}`} className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <h1 className="text-2xl font-semibold">Financial reports</h1>
      <p className="text-sm text-muted-foreground">Period: {data.periodLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Sales" value={fmt(data.sales.total)} />
        <Card label="Other income" value={fmt(data.finance.otherIncome)} />
        <Card label="Expenses" value={fmt(data.finance.expenses)} />
        <Card label="Net (approx)" value={fmt(data.finance.netCash)} />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Payment method</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.payments.byMethod.map((m) => (
              <tr key={m.method} className="border-t">
                <td className="p-3">{m.method}</td>
                <td className="p-3">{fmt(m.total)}</td>
                <td className="p-3">{m.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Full double-entry P&amp;L will use chart of accounts journals as those
        postings mature. This view is cash-oriented operational reporting.
      </p>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
