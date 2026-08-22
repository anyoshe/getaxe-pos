import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sales orders: credit / unpaid completed sales pending settlement.
 */
export default async function SalesOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const all = await salesQueryService.listSales(user.businessId, { limit: 100 });
  const open = all.filter(
    (s) =>
      s.paymentStatus === "PENDING" ||
      s.paymentStatus === "PARTIAL" ||
      s.status === "CREDIT" ||
      s.status === "PARTIALLY_PAID",
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sales
          </p>
          <h1 className="text-2xl font-semibold">Sales orders</h1>
          <p className="text-sm text-muted-foreground">
            Open balances and credit sales awaiting full payment.
          </p>
        </div>
        <Link href="/sales/pos" className={cn(buttonVariants())}>
          Open POS
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {open.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No open orders. Paid sales are under{" "}
                  <Link href="/sales/invoices" className="text-primary underline">
                    Invoices
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              open.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">
                    <Link
                      href={`/sales/invoices/${s.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {s.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3">{s.status}</td>
                  <td className="p-3">{s.paymentStatus}</td>
                  <td className="p-3 text-right tabular-nums">
                    {Number(s.balanceDue ?? 0).toFixed(2)}
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
