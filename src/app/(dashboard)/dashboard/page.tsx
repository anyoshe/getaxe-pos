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

export default async function DashboardPage() {
  const dashboard = await getOwnerDashboardAction();
  const { summary } = dashboard;
  const saleCount = summary.todaySalesCount ?? 0;

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
          href="/inventory/stock"
          icon={PackagePlus}
        />

        <QuickActionCard
          title="Invoices"
          description="View completed sales."
          href="/sales/invoices"
          icon={FileText}
        />
      </div>
    </div>
  );
}
