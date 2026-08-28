import Link from "next/link";
import {
  Building2,
  ClipboardList,
  CreditCard,
  GitBranch,
  Hash,
  Ruler,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";

const cards = [
  {
    href: "/settings/business",
    title: "Business profile",
    desc: "Name, KRA, contact, operational defaults",
    icon: Building2,
  },
  {
    href: "/settings/branches",
    title: "Branches",
    desc: "Locations and head office",
    icon: GitBranch,
  },
  {
    href: "/settings/warehouses",
    title: "Warehouses",
    desc: "Stock locations linked to branches",
    icon: Warehouse,
  },
  {
    href: "/settings/users",
    title: "Users & roles",
    desc: "Staff accounts and access",
    icon: Users,
  },
  {
    href: "/settings/roles",
    title: "Roles & permissions",
    desc: "Permission sets for staff",
    icon: ShieldCheck,
  },
  {
    href: "/settings/units",
    title: "Units of measure",
    desc: "Piece, box, kg, litre…",
    icon: Ruler,
  },
  {
    href: "/settings/numbering",
    title: "Document numbering",
    desc: "Invoice, PO, GRN prefixes",
    icon: Hash,
  },
  {
    href: "/settings/payment-methods",
    title: "Payment methods",
    desc: "Cash, M-Pesa, card at POS",
    icon: CreditCard,
  },
  {
    href: "/settings/audit-log",
    title: "Audit log",
    desc: "Who changed what",
    icon: ClipboardList,
  },
];

export function SettingsHub({
  summary,
}: {
  summary: {
    branches: number;
    warehouses: number;
    users: number;
    units: number;
  };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure the business, locations, people, and system defaults.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Branches" value={summary.branches} />
        <Stat label="Warehouses" value={summary.warehouses} />
        <Stat label="Users" value={summary.users} />
        <Stat label="Units" value={summary.units} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold group-hover:text-primary">
                  {c.title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
