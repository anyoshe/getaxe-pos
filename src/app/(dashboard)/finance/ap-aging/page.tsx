import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getApAging } from "@/features/finance/services/ap-aging.service";

function money(n: number) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function ApAgingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const aging = await getApAging(user.businessId);
  const { buckets, detail, source } = aging;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Accounts payable aging
          </h1>
          <p className="text-sm text-muted-foreground">
            Open supplier balances waiting to be paid. Source:{" "}
            <span className="font-medium text-foreground">
              {source === "supplier_invoices"
                ? "Supplier invoices"
                : "Purchase orders (create an invoice to pay)"}
            </span>
          </p>
        </div>
        <Link
          href="/purchases/supplier-invoices"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Record payment / invoices
        </Link>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <p className="font-medium text-foreground">How to clear a balance</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
          <li>
            Open{" "}
            <Link
              href="/purchases/supplier-invoices"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Purchases → Supplier invoices
            </Link>
          </li>
          <li>
            If the bill is missing, use <strong>New supplier invoice</strong>{" "}
            (supplier, invoice #, total).
          </li>
          <li>
            Under <strong>Record payment</strong>, select the invoice, enter the
            amount (full balance to clear), click <strong>Pay</strong>.
          </li>
          <li>
            Paid invoices leave aging; journals post Dr AP / Cr Cash.
          </li>
        </ol>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {(
          [
            ["Current", buckets.current],
            ["31–60", buckets.d30],
            ["61–90", buckets.d60],
            ["91–120", buckets.d90],
            ["120+", buckets.older],
          ] as const
        ).map(([label, val]) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {money(val)}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Reference</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Status</th>
              <th className="p-3">Days</th>
              <th className="p-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {detail.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-muted-foreground"
                >
                  No open payables. All clear.
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
