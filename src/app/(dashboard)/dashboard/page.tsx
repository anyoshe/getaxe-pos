export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
  ShoppingCart,
  Package,
  Users,
  UserPlus,
  PackagePlus,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Banknote,
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
import type { AttentionKind } from "@/features/dashboard/types";

function attentionStyles(kind: AttentionKind) {
  switch (kind) {
    case "restock":
      return "border-rose-500/30 bg-rose-500/5";
    case "expiry":
      return "border-amber-500/30 bg-amber-500/5";
    case "receivable":
    case "payable":
      return "border-blue-500/30 bg-blue-500/5";
    case "slow":
      return "border-orange-500/30 bg-orange-500/5";
    default:
      return "border-border bg-card";
  }
}

export default async function DashboardPage() {
  const dashboard = await getOwnerDashboardAction();
  const user = await getCurrentUser();
  const readiness = user
    ? await getSetupReadiness(user.businessId).catch(() => null)
    : null;
  const {
    summary,
    attention,
    lowStockItems,
    expiringBatches,
    topProducts,
    slowProducts,
  } = dashboard;
  const saleCount = summary.todaySalesCount ?? 0;
  const incomplete =
    readiness?.checks.filter((c) => !c.done && !c.optional) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your business today"
        description="See sales, stock, cash and what needs your attention — so you can decide with facts, even when you are not at the counter."
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
          title="Needs restock"
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
              <h2 className="font-semibold">
                Setup readiness · {readiness.score}%
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete these so POS, stock, and purchasing work smoothly for
                any business type.
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
        title="Needs your attention"
        description="Priorities for the owner — restock, expiry, money owed, and slow stock"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {attention.map((item, idx) => (
          <Link
            key={`${item.kind}-${idx}`}
            href={item.href}
            className={`group rounded-xl border p-4 shadow-sm transition hover:border-primary/40 ${attentionStyles(item.kind)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.detail}
                </p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="mt-2 text-xs font-medium text-primary">
              Review and decide →
            </p>
          </Link>
        ))}
      </div>

      <SectionHeader
        title="Money in the business"
        description="Tills, collections, and open balances — same sources as Cash & bank / AP / AR"
      />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          {
            label: "Cash & bank",
            value: Number(summary.cashTotal ?? 0),
            hint: "All tills (ledger)",
            href: "/finance/cash-accounts",
          },
          {
            label: "Today cash in",
            value: Number(summary.todayCashIn ?? 0),
            hint:
              (summary.todayCashByMethod ?? [])
                .map(
                  (m: { method: string; total: number }) =>
                    `${m.method} ${Number(m.total).toLocaleString()}`,
                )
                .join(" · ") || "No collections yet",
            href: "/finance/payments",
          },
          {
            label: "Open receivables",
            value: Number(summary.openAr ?? 0),
            hint: "Credit invoices due",
            href: "/sales/receivables",
          },
          {
            label: "Open payables",
            value: Number(summary.openAp ?? 0),
            hint: "Supplier bills unpaid",
            href: "/purchases/supplier-invoices",
          },
          {
            label: "Stock at cost",
            value: Number(summary.stockValue ?? 0),
            hint: "Capital tied in inventory",
            href: "/inventory/stock",
          },
        ].map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
              KES{" "}
              {kpi.value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
              {kpi.hint}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h3 className="font-semibold">Restock these</h3>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No items at or below reorder level.
            </p>
          ) : (
            <ul className="space-y-2">
              {lowStockItems.map((item) => (
                <li key={item.productId}>
                  <Link
                    href="/inventory/stock"
                    className="flex items-baseline justify-between gap-2 text-sm hover:text-primary"
                  >
                    <span className="line-clamp-1 font-medium">
                      {item.name}
                      {item.sku ? (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          {item.sku}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.quantity} / {item.reorderLevel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/purchases/orders"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Create purchase order <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold">Expiring soon</h3>
          </div>
          {expiringBatches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No batches with quantity expiring in the next 90 days.
            </p>
          ) : (
            <ul className="space-y-2">
              {expiringBatches.map((b) => (
                <li
                  key={`${b.productId}-${b.batchNumber}-${b.expiryDate}`}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <span className="line-clamp-1">
                    <span className="font-medium">{b.productName}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {b.batchNumber}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-amber-700 dark:text-amber-400">
                    {b.expiryDate}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/inventory/batches"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View batches <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <h3 className="font-semibold">Moving fast (30 days)</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed sales in the last 30 days. Run POS or widen history
              under Reports.
            </p>
          ) : (
            <ul className="space-y-2">
              {topProducts.map((p) => (
                <li
                  key={p.productId}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <span className="line-clamp-1 font-medium">{p.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    KES{" "}
                    {p.revenue.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/reports/sales"
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Sales performance <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {slowProducts.length > 0 && (
        <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-orange-600" />
            <h3 className="font-semibold">
              Stock with no sales in 30 days — reconsider buying more
            </h3>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {slowProducts.map((s) => (
              <li key={s.productId} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{s.name}</span>
                {s.sku ? (
                  <span className="ml-1 font-mono text-xs">{s.sku}</span>
                ) : null}
                <span className="ml-1 tabular-nums">· qty {s.quantity}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/reports/inventory"
            className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
          >
            Inventory reports →
          </Link>
        </div>
      )}

      <SectionHeader
        title="Common tasks"
        description="Operate the business — staff can run these without you at the counter"
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
          description="Register a customer for loyalty or credit."
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
          description="View completed sales and reprints."
          href="/sales/invoices"
          icon={FileText}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          title="Purchase order"
          description="Order what the restock list suggests."
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
          title="Business insights"
          description="Sales, stock, cash and profit reports."
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
