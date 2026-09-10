import Link from "next/link";
import { eq, sql } from "drizzle-orm";

import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { products } from "@/db/schema/inventory/products";
import { cashAccounts } from "@/db/schema/finance/cash_accounts";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { ensureFinanceDefaults } from "@/features/finance/services/finance.service";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  await ensureFinanceDefaults(user.businessId).catch(() => null);

  const [biz] = await db
    .select({
      name: businesses.name,
      kraPin: businesses.kraPin,
    })
    .from(businesses)
    .where(eq(businesses.id, user.businessId))
    .limit(1);

  const caps = await new BusinessCapabilityRepository()
    .listEnabled(user.businessId)
    .catch(() => [] as string[]);

  const controlledOn = caps.includes("pharmacy.controlled-medicines");
  const [controlledCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(products)
    .where(
      sql`${products.businessId} = ${user.businessId} AND ${products.isControlled} = true`,
    )
    .catch(() => [{ c: 0 }]);

  const tills = await db
    .select({
      name: cashAccounts.name,
      type: cashAccounts.type,
      accountId: cashAccounts.accountId,
      code: chartOfAccounts.accountCode,
    })
    .from(cashAccounts)
    .leftJoin(
      chartOfAccounts,
      eq(cashAccounts.accountId, chartOfAccounts.id),
    )
    .where(eq(cashAccounts.businessId, user.businessId))
    .catch(() => []);

  const byGl = new Map<string, string[]>();
  for (const t of tills) {
    const k = t.accountId ?? "none";
    const list = byGl.get(k) ?? [];
    list.push(t.name);
    byGl.set(k, list);
  }
  const shared = [...byGl.values()].filter((n) => n.length > 1);

  const checks = [
    {
      ok: Boolean(biz?.kraPin && String(biz.kraPin).trim().length >= 8),
      label: "KRA PIN on business profile",
      href: "/settings/business",
      note: "Required for invoices and future fiscal integration",
    },
    {
      ok: shared.length === 0 && tills.length > 0,
      label: "Each cash till has its own ledger account",
      href: "/finance/cash-accounts",
      note: shared.length
        ? `Shared: ${shared.map((s) => s.join(" + ")).join("; ")}`
        : "Cash / M-Pesa / bank mapped separately",
    },
    {
      ok: !controlledOn || Number(controlledCount?.c ?? 0) >= 0,
      label: controlledOn
        ? `Controlled medicines capability on (${controlledCount?.c ?? 0} flagged products)`
        : "Controlled medicines capability off (enable only if you sell schedules)",
      href: controlledOn
        ? "/pharmacy/controlled-register"
        : "/settings/capabilities",
      note: "Flag products + use Controlled register for audit trail",
    },
    {
      ok: false,
      label: "eTIMS / OSCU device certification",
      href: "/settings/business",
      note: "Not certified in v1 — KRA device integration is v2. Structure (PIN, invoices, audit) is ready; do not claim eTIMS compliance until a certified device is connected.",
    },
  ];

  const hostOk = checks.filter((c) => !c.label.includes("eTIMS")).every((c) => c.ok);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link href="/settings" className="text-sm text-primary hover:underline">
          ← Settings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Compliance & hosting checks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {biz?.name ?? "Business"} — operational compliance for product
          businesses. eTIMS remains a certified-device step outside this app
          build.
        </p>
      </div>

      <div
        className={
          "rounded-xl border p-4 text-sm " +
          (hostOk
            ? "border-chart-4/40 bg-chart-4/10"
            : "border-destructive/30 bg-destructive/5")
        }
      >
        <p className="font-semibold">
          {hostOk
            ? "Operational checks look ready for hosting."
            : "Fix the items below before treating this business as production-ready."}
        </p>
        <p className="mt-1 text-muted-foreground">
          eTIMS is listed honestly as not certified in v1 so you do not over-claim
          to regulators.
        </p>
      </div>

      <ul className="space-y-3">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-card p-4"
          >
            <div>
              <p className="font-medium">
                <span className={c.ok ? "text-chart-4" : "text-destructive"}>
                  {c.ok ? "✓" : "○"}
                </span>{" "}
                {c.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
            </div>
            <Link
              href={c.href}
              className="text-sm font-medium text-primary hover:underline"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-xl border p-4 text-sm">
        <h2 className="font-semibold">Till → ledger map</h2>
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="py-1">Till</th>
              <th className="py-1">Type</th>
              <th className="py-1">GL</th>
            </tr>
          </thead>
          <tbody>
            {tills.map((t) => (
              <tr key={t.name} className="border-t">
                <td className="py-1.5">{t.name}</td>
                <td className="py-1.5">{t.type}</td>
                <td className="py-1.5 font-mono">{t.code ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
