import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Banknote,
  ClipboardList,
  FileText,
  Package,
  Pill,
  ShoppingCart,
  Truck,
  Warehouse,
} from "lucide-react";

import type { OwnerDashboard } from "../types";
import type { RoleHomeConfig } from "../lib/role-home";

function money(n: number) {
  return `KES ${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

type Props = {
  home: RoleHomeConfig;
  dashboard: OwnerDashboard;
  userName: string;
};

function QuickLink({
  href,
  label,
  icon: Icon,
  hint,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="font-medium text-foreground">{label}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function CashierHomePanel({ home, dashboard, userName }: Props) {
  const s = dashboard.summary;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          {home.title}
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          {home.description}
        </p>
        <Link
          href={home.primaryHref}
          className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          <ShoppingCart className="h-5 w-5" />
          {home.primaryLabel}
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">
          Shop today: {money(s.todaySales)} · {s.todaySalesCount ?? 0} sale
          {(s.todaySalesCount ?? 0) === 1 ? "" : "s"} completed
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/sales/pos"
          label="Point of sale"
          icon={ShoppingCart}
          hint="Scan, pay, print receipt"
        />
        <QuickLink
          href="/sales/invoices"
          label="Today’s invoices"
          icon={FileText}
          hint="Reprint or look up a sale"
        />
        <QuickLink
          href="/customers"
          label="Customers"
          icon={ClipboardList}
          hint="Lookup by phone for loyalty / credit"
        />
      </div>
    </div>
  );
}

export function AccountantHomePanel({ home, dashboard, userName }: Props) {
  const s = dashboard.summary;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold">{home.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{home.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Cash & bank", value: s.cashTotal },
            { label: "Today in", value: s.todayCashIn },
            { label: "Open AR", value: s.openAr },
            { label: "Open AP", value: s.openAp },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl border border-border bg-background/60 p-3"
            >
              <p className="text-[11px] text-muted-foreground">{k.label}</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums">
                {money(k.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/finance/cash-accounts"
          label="Cash & bank"
          icon={Banknote}
        />
        <QuickLink
          href="/finance/reconciliation"
          label="Daily reconciliation"
          icon={ClipboardList}
        />
        <QuickLink
          href="/finance/journals"
          label="Journals"
          icon={FileText}
        />
        <QuickLink
          href="/finance/ap-aging"
          label="AP ageing"
          icon={Truck}
        />
        <QuickLink
          href="/sales/receivables"
          label="Receivables"
          icon={FileText}
        />
        <QuickLink href="/reports/finance" label="Financial reports" icon={FileText} />
      </div>
    </div>
  );
}

export function StoreHomePanel({ home, dashboard, userName }: Props) {
  const s = dashboard.summary;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold">{home.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{home.description}</p>
        <p className="mt-3 text-sm">
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {s.lowStock}
          </span>{" "}
          product{s.lowStock === 1 ? "" : "s"} at or below reorder · stock at
          cost {money(s.stockValue)}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/inventory/stock"
          label="Stock on hand"
          icon={Warehouse}
        />
        <QuickLink
          href="/inventory/stock/receive"
          label="Receive stock"
          icon={Package}
        />
        <QuickLink
          href="/inventory/transfers"
          label="Transfers"
          icon={Truck}
        />
        <QuickLink
          href="/inventory/stock-movements"
          label="Movements"
          icon={ClipboardList}
        />
        <QuickLink
          href="/dashboard/attention?focus=restock"
          label="Restock list"
          icon={Package}
          hint={`${s.lowStock} need attention`}
        />
        <QuickLink
          href="/purchases/receiving"
          label="GRN / receiving"
          icon={Truck}
        />
      </div>
    </div>
  );
}

export function PurchasingHomePanel({ home, dashboard, userName }: Props) {
  const s = dashboard.summary;
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold">{home.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{home.description}</p>
        <p className="mt-3 text-sm">
          Open payables {money(s.openAp)} · low stock {s.lowStock}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink
          href="/purchases/orders"
          label="Purchase orders"
          icon={ClipboardList}
        />
        <QuickLink
          href="/purchases/receiving"
          label="Goods receiving"
          icon={Package}
        />
        <QuickLink
          href="/purchases/supplier-invoices"
          label="Supplier invoices"
          icon={FileText}
        />
        <QuickLink href="/inventory/suppliers" label="Suppliers" icon={Truck} />
        <QuickLink
          href="/dashboard/attention?focus=restock"
          label="What to reorder"
          icon={Package}
        />
      </div>
    </div>
  );
}

export function PharmacistHomePanel({ home, dashboard, userName }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold">{home.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{home.description}</p>
        <Link
          href={home.primaryHref}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <ShoppingCart className="h-4 w-4" />
          {home.primaryLabel}
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/sales/pos" label="POS / dispense" icon={ShoppingCart} />
        <QuickLink
          href="/pharmacy/dispensing"
          label="Dispensing"
          icon={Pill}
        />
        <QuickLink
          href="/pharmacy/controlled-register"
          label="Controlled register"
          icon={ClipboardList}
        />
        <QuickLink
          href="/dashboard/attention?focus=expiry"
          label="Near expiry"
          icon={Package}
          hint={`${dashboard.expiringBatches?.length ?? 0} batch(es)`}
        />
        <QuickLink href="/inventory/stock" label="Stock on hand" icon={Warehouse} />
      </div>
    </div>
  );
}

export function StaffHomePanel({ home, userName }: { home: RoleHomeConfig; userName: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Hello, {userName}</p>
        <h2 className="mt-1 text-xl font-semibold">{home.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{home.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/sales/pos" label="Point of sale" icon={ShoppingCart} />
        <QuickLink href="/inventory/stock" label="Stock" icon={Warehouse} />
        <QuickLink href="/customers" label="Customers" icon={ClipboardList} />
        <QuickLink href="/settings/setup-guide" label="Setup guide" icon={FileText} />
      </div>
    </div>
  );
}
