import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quotations: sales saved as DRAFT (no stock deduction).
 * Create via future quote builder; for now list drafts if any.
 */
export default async function QuotationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const drafts = await salesQueryService.listSales(user.businessId, {
    status: "DRAFT",
    limit: 50,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Sales
          </p>
          <h1 className="text-2xl font-semibold">Quotations</h1>
          <p className="text-sm text-muted-foreground">
            Draft offers before converting to a sale. Use POS for immediate
            checkout; quote builder can be extended next.
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
              <th className="p-3">Quote / draft #</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No draft quotations yet. Completed sales appear under{" "}
                  <Link href="/sales/invoices" className="text-primary underline">
                    Invoices
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              drafts.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 font-medium">{d.invoiceNumber}</td>
                  <td className="p-3">{d.status}</td>
                  <td className="p-3 text-right">
                    {Number(d.total ?? 0).toFixed(2)}
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
