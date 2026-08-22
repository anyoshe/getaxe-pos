import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function money(v: string | number | null) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(Number(v ?? 0));
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;

  const detail = await salesQueryService.getSaleDetail(user.businessId, id);
  if (!detail) notFound();

  const { sale, items } = detail;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Invoice
          </p>
          <h1 className="text-2xl font-semibold">{sale.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {sale.status} · {sale.paymentStatus}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/sales/returns?saleId=${sale.id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Return items
          </Link>
          <Link
            href="/sales/invoices"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Back
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{i.productName}</div>
                  {i.sku ? (
                    <div className="text-xs text-muted-foreground">{i.sku}</div>
                  ) : null}
                </td>
                <td className="p-3 text-right tabular-nums">{i.quantity}</td>
                <td className="p-3 text-right tabular-nums">
                  {money(i.unitPrice)}
                </td>
                <td className="p-3 text-right tabular-nums font-medium">
                  {money(i.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-56 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{money(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">{money(sale.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span>{money(sale.amountPaid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
