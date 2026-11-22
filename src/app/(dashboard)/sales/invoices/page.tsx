import Link from "next/link";
import { FileText } from "lucide-react";

import { requirePageAccess } from "@/lib/auth/authorize";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
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
  const user = await requirePageAccess("sales.view");

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
          Open till
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Completed sales will show here after you finish a sale on the till."
          actionHref="/sales/pos"
          actionLabel="Open till"
        />
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="grid gap-3 md:hidden">
            {rows.map((r) => {
              const isCredit =
                Number(r.balanceDue ?? 0) > 0.001 ||
                r.paymentStatus === "PENDING" ||
                r.paymentStatus === "PARTIAL";
              return (
                <li key={r.id}>
                  <Link
                    href={`/sales/invoices/${r.id}`}
                    className="block rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{r.invoiceNumber}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {fmt(r.soldAt)}
                        </p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {isCredit ? "Credit / unpaid" : "Cash sale"} ·{" "}
                          {r.paymentStatus}
                        </p>
                      </div>
                      <p className="shrink-0 text-base font-semibold tabular-nums">
                        {money(r.total)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs font-medium text-primary">View →</p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border md:block">
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
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3 font-medium">
                      {r.invoiceNumber}
                      <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                        {Number(r.balanceDue ?? 0) > 0.001 ||
                        r.paymentStatus === "PENDING" ||
                        r.paymentStatus === "PARTIAL"
                          ? "Credit / unpaid"
                          : "Cash sale"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{fmt(r.soldAt)}</td>
                    <td className="p-3">{r.paymentStatus}</td>
                    <td className="p-3 text-right tabular-nums">{money(r.total)}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/sales/invoices/${r.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </td>
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
