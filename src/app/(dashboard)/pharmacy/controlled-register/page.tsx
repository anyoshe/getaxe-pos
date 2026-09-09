import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/current-user";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { formatDateTimeNairobi } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export default async function ControlledRegisterPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const caps = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  if (!caps.includes("pharmacy.controlled-medicines")) {
    redirect("/settings/capabilities");
  }

  const catalog = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
    })
    .from(products)
    .where(
      and(
        eq(products.businessId, user.businessId),
        eq(products.isControlled, true),
        eq(products.active, true),
      ),
    );

  const movements = await db
    .select({
      soldAt: sales.soldAt,
      invoiceNumber: sales.invoiceNumber,
      productName: products.name,
      sku: products.sku,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(
        eq(sales.businessId, user.businessId),
        eq(products.isControlled, true),
        eq(sales.status, "COMPLETED"),
      ),
    )
    .orderBy(desc(sales.soldAt))
    .limit(200);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <Link href="/pharmacy/dispensing" className="text-sm text-primary hover:underline">
          ← Pharmacy
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Controlled medicines register
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Products flagged <strong>Controlled medicine</strong> and their completed
          sales. Use for internal audit; keep paper registers if regulations require.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Catalogue ({catalog.length})</h2>
        {catalog.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No controlled products yet. Edit a medicine and enable{" "}
            <em>Controlled medicine</em> under inventory behaviour.
          </p>
        ) : (
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {catalog.map((p) => (
              <li key={p.id} className="font-mono text-xs">
                <span className="font-sans font-medium">{p.name}</span>
                {p.sku ? ` · ${p.sku}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Doc</th>
              <th className="p-3">Product</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Unit price</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No controlled sales recorded yet.
                </td>
              </tr>
            ) : (
              movements.map((m, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3 whitespace-nowrap text-xs">
                    {m.soldAt
                      ? formatDateTimeNairobi(m.soldAt)
                      : "—"}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    {m.invoiceNumber ?? "—"}
                  </td>
                  <td className="p-3">
                    {m.productName}
                    {m.sku ? (
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        {m.sku}
                      </span>
                    ) : null}
                  </td>
                  <td className="p-3 text-right tabular-nums">{m.quantity}</td>
                  <td className="p-3 text-right tabular-nums">
                    {Number(m.unitPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
