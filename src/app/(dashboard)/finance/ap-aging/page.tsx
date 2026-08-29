import { getCurrentUser } from "@/lib/auth/current-user";
import { getApAging } from "@/features/finance/services/ap-aging.service";

function money(n: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function ApAgingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const aging = await getApAging(user.businessId);
  const { buckets, detail } = aging;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Accounts payable aging
        </h1>
        <p className="text-sm text-muted-foreground">
          Based on supplier invoices when available, otherwise open purchase
          orders. Manage bills under Purchasing → Supplier invoices.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(
          [
            ["Current (0–30)", buckets.current],
            ["31–60 days", buckets.d30],
            ["61–90 days", buckets.d60],
            ["91–120 days", buckets.d90],
            ["120+ days", buckets.older],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {money(value)}
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">PO</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
              <th className="p-3">Days</th>
              <th className="p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {detail.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No open purchase orders.
                </td>
              </tr>
            ) : (
              detail.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{d.orderNumber}</td>
                  <td className="p-3">{d.supplierName}</td>
                  <td className="p-3">{d.status}</td>
                  <td className="p-3">{d.days}</td>
                  <td className="p-3 tabular-nums">{money(d.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
