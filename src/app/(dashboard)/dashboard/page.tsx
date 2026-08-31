import {
  ShoppingCart,
  Package,
  Users,
  UserPlus,
  PackagePlus,
  FileText,
  AlertTriangle,
} from "lucide-react";

import {
  PageHeader,
  StatCard,
  QuickActionCard,
  SectionHeader,
} from "@/components/shared";

import { getOwnerDashboardAction } from "@/features/dashboard/actions";
import { getSetupReadiness } from "@/features/settings/services/setup-readiness.service";
import { getCurrentUser } from "@/lib/auth/current-user";
import Link from "next/link";

export default async function DashboardPage() {
  const dashboard = await getOwnerDashboardAction();
  const user = await getCurrentUser();
  const readiness = user
    ? await getSetupReadiness(user.businessId).catch(() => null)
    : null;
  const { summary } = dashboard;
  const saleCount = summary.todaySalesCount ?? 0;
  const incomplete =
    readiness?.checks.filter((c) => !c.done && !c.optional) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back 👋"
        description="Live snapshot of sales, inventory, customers, and daily operations."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Sales"
          value={`KSh ${Number(summary.todaySales).toLocaleString()}`}
          subtitle={
            saleCount === 0
              ? "No completed sales today"
              : `${saleCount} sale${saleCount === 1 ? "" : "s"} today`
          }
          icon={ShoppingCart}
          gradient="bg-gradient-to-r from-blue-600 to-indigo-600"
        />

        <StatCard
          title="Customers"
          value={summary.customers.toString()}
          subtitle="Registered in CRM"
          icon={Users}
          gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
        />

        <StatCard
          title="Products"
          value={summary.products.toString()}
          subtitle="In catalogue"
          icon={Package}
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
        />

        <StatCard
          title="Low Stock"
          value={summary.lowStock.toString()}
          subtitle={
            summary.lowStock === 0
              ? "All tracked items healthy"
              : "At or below reorder level"
          }
          icon={AlertTriangle}
          gradient="bg-gradient-to-r from-rose-500 to-orange-500"
        />
      </div>

      {readiness && readiness.score < 100 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">Setup readiness · {readiness.score}%</h2>
              <p className="text-sm text-muted-foreground">
                Complete these so POS, stock, and purchasing work smoothly for any business type.
              </p>
            </div>
            <Link
              href="/settings/readiness"
              className="text-sm font-medium text-primary hover:underline"
            >
              Open settings →
            </Link>
          </div>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {incomplete.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.href}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  ○ {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SectionHeader
        title="Quick Actions"
        description="Jump to the tasks you use most"
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          title="Open POS"
          description="Scan and sell at the register."
          href="/sales/pos"
          icon={ShoppingCart}
        />

        <QuickActionCard
          title="New Customer"
          description="Register a customer for loyalty."
          href="/customers"
          icon={UserPlus}
        />

        <QuickActionCard
          title="Receive Stock"
          description="Add stock on hand / receipts."
          href="/inventory/stock/receive"
          icon={PackagePlus}
        />

        <QuickActionCard
          title="Invoices"
          description="View completed sales."
          href="/sales/invoices"
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          title="Purchase order"
          description="Order stock from suppliers."
          href="/purchases/orders"
          icon={PackagePlus}
        />
        <QuickActionCard
          title="Products"
          description="Catalogue and packaging units."
          href="/inventory/products"
          icon={Package}
        />
        <QuickActionCard
          title="Reports"
          description="Sales, stock, cash graphs."
          href="/reports"
          icon={FileText}
        />
        <QuickActionCard
          title="Capabilities"
          description="Enable pharmacy, serials, batches…"
          href="/settings/capabilities"
          icon={AlertTriangle}
        />
      </div>
    </div>
  );
}
