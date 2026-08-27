import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { reportsOverviewService } from "@/features/reports/services/reports-overview.service";

export default async function InventoryReportsPage({
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

  return (
    <div className="space-y-4">
      <Link href={`/reports?period=${period}`} className="text-sm text-primary hover:underline">
        ← All reports
      </Link>
      <h1 className="text-2xl font-semibold">Inventory reports</h1>
      <p className="text-sm text-muted-foreground">Period: {data.periodLabel}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">On-hand qty</div>
          <div className="text-2xl font-semibold">
            {data.inventory.onHandQty.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Low stock SKUs</div>
          <div className="text-2xl font-semibold">
            {data.inventory.lowStockCount}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-muted-foreground">Movement types</div>
          <div className="text-2xl font-semibold">
            {data.inventory.movements.length}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Transactions</th>
            </tr>
          </thead>
          <tbody>
            {data.inventory.movements.map((m) => (
              <tr key={m.type} className="border-t">
                <td className="p-3">{m.type}</td>
                <td className="p-3">{m.qty.toLocaleString()}</td>
                <td className="p-3">{m.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
