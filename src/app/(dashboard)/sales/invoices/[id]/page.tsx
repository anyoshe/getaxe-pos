import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/current-user";
import { salesQueryService } from "@/features/sales/services/sales-query.service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { customers } from "@/db/schema/sales/customers";
import { InvoiceReprintButton } from "@/features/sales/components/invoices/invoice-reprint-button";

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

  const [businessRow, customerRow] = await Promise.all([
    db.query.businesses
      .findFirst({ where: eq(businesses.id, user.businessId) })
      .catch(() => null),
    sale.customerId
      ? db
          .select()
          .from(customers)
          .where(eq(customers.id, sale.customerId))
          .limit(1)
          .then((r) => r[0] ?? null)
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const isCredit =
    sale.paymentStatus === "PENDING" ||
    sale.paymentStatus === "PARTIAL" ||
    Number(sale.balanceDue ?? 0) > 0.001;

  const customerName = customerRow
    ? [customerRow.firstName, customerRow.lastName].filter(Boolean).join(" ") ||
      customerRow.companyName
    : null;

  const receipt = {
    invoiceNumber: sale.invoiceNumber,
    soldAt: sale.soldAt
      ? new Date(sale.soldAt).toLocaleString()
      : "—",
    cashierName: null as string | null,
    customerName,
    customerPhone: customerRow?.phone ?? null,
    paymentMethod: isCredit ? "CREDIT" : "CASH",
    isCredit,
    amountPaid: Number(sale.amountPaid ?? 0),
    balanceDue: Number(sale.balanceDue ?? 0),
    subtotal: Number(sale.subtotal ?? sale.total ?? 0),
    total: Number(sale.total ?? 0),
    notes: sale.notes,
    lines: items.map((it) => ({
      name: it.productName || "Item",
      quantity: Number(
        (it as { quantityEntered?: string | number }).quantityEntered ??
          it.quantity,
      ),
      unitLabel: null as string | null,
      unitPrice: Number(it.unitPrice ?? 0),
      total: Number(it.total ?? 0),
    })),
  };

  const business = {
    name: businessRow?.name ?? "GetAxe POS",
    legalName: businessRow?.legalName ?? null,
    phone: businessRow?.phone ?? null,
    email: businessRow?.email ?? null,
    address: businessRow?.address ?? null,
    town: businessRow?.town ?? null,
    county: businessRow?.county ?? null,
    kraPin: businessRow?.kraPin ?? null,
    registrationNumber: businessRow?.registrationNumber ?? null,
    logo: businessRow?.logo ?? null,
    currency: businessRow?.currency ?? "KES",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {isCredit ? "Credit invoice" : "Cash sale"}
          </p>
          <h1 className="text-2xl font-semibold">{sale.invoiceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {sale.status} · {sale.paymentStatus}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InvoiceReprintButton business={business} receipt={receipt} />
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
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3 font-medium">{it.productName}</td>
                <td className="p-3 text-right tabular-nums">{it.quantity}</td>
                <td className="p-3 text-right tabular-nums">
                  {money(it.unitPrice)}
                </td>
                <td className="p-3 text-right tabular-nums">{money(it.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="tabular-nums">{money(sale.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{money(sale.total)}</span>
        </div>
        <div className="mt-1 flex justify-between text-muted-foreground">
          <span>Paid</span>
          <span className="tabular-nums">{money(sale.amountPaid)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Balance due</span>
          <span className="tabular-nums">{money(sale.balanceDue)}</span>
        </div>
      </div>
    </div>
  );
}
