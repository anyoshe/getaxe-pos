import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { formatDateTimeNairobi } from "@/lib/timezone";

function money(v: string | number | null) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(Number(v ?? 0));
}

function fmt(d: Date | string) {
  return formatDateTimeNairobi(d);
}

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rows = await salesQueryService.listSales(user.businessId, {
    status: "COMPLETED",
    limit: 100,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sales
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Completed sales from POS and other channels.
          </p>
        </div>
        <Link href="/sales/pos" className={cn(buttonVariants())}>
          Open POS
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3 font-medium">Invoice</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Payment</th>
              <th className="p-3 font-medium text-right">Total</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-medium">{r.invoiceNumber}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.soldAt)}</td>
                  <td className="p-3">{r.paymentStatus}</td>
                  <td className="p-3 text-right tabular-nums">
                    {money(r.total)}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/sales/invoices/${r.id}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      View
                    </Link>
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
