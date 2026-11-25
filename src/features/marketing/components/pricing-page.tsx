import Link from "next/link";
import { Check } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  blurb: string;
  highlight?: boolean;
  cta: string;
  href: string;
  limits: string[];
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "1,500",
    period: "/ month",
    blurb: "One shop getting off the notebook.",
    cta: "Start free trial",
    href: "/login",
    limits: ["1 branch", "Up to 3 users"],
    features: [
      "Full-screen POS — scan, cash & card",
      "Products, categories & stock on hand",
      "Starter kits to load a catalogue fast",
      "Expenses, incomes & simple dashboard",
      "Basic sales reports",
      "Roles for owner and cashier",
      "Works on phone, tablet and computer",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "2,800",
    period: "/ month",
    blurb: "Busy retail, hardware and spare-parts shops.",
    highlight: true,
    cta: "Start free trial",
    href: "/login",
    limits: ["Up to 2 branches", "Up to 8 users"],
    features: [
      "Everything in Starter",
      "Credit sales & who owes you (receivables)",
      "Quotations, invoices & sales orders",
      "Purchases, receiving (GRN) & suppliers",
      "Warehouses, transfers & stock adjustments",
      "Returns, price lists & cost/markup control",
      "Cash accounts, payments & reconciliation",
      "M-Pesa settings path & offline sale queue",
      "Owner dashboard priorities & AI setup help",
    ],
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    price: "4,200",
    period: "/ month",
    blurb: "Chemists and dispensaries that need batch control.",
    cta: "Talk to us",
    href: "/login",
    limits: ["Up to 2 branches", "Up to 10 users"],
    features: [
      "Everything in Business",
      "Pharmacy catalogues & dosage forms",
      "Batch, expiry & FEFO-aware selling",
      "Dispensing workflow & controlled register",
      "Programme / supply-channel products (ART/TB path)",
      "Manufacturers & pharmacy-ready product fields",
      "Go-live kits tuned for pharmacy stock",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "7,500",
    period: "/ month",
    blurb: "Several branches under one owner view.",
    cta: "Talk to us",
    href: "/login",
    limits: ["Up to 5 branches", "Up to 15 users"],
    features: [
      "Everything in Pharmacy or Business",
      "Multi-branch stock transfers at scale",
      "Cycle counts & deeper inventory ops",
      "Promotional pricing capability",
      "eTIMS settings & compliance workspace",
      "Advanced roles, audit log & security settings",
      "Priority onboarding support",
    ],
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article
      className={
        plan.highlight
          ? "relative flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-lg ring-1 ring-primary/20"
          : "flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
      }
    >
      {plan.highlight ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Most chosen
        </span>
      ) : null}

      <header className="space-y-1">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {plan.name}
        </h2>
        <p className="text-sm text-muted-foreground">{plan.blurb}</p>
      </header>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-sm font-medium text-muted-foreground">KES</span>
        <span className="text-4xl font-black tabular-nums tracking-tight text-foreground">
          {plan.price}
        </span>
        <span className="text-sm text-muted-foreground">{plan.period}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Exclusive of VAT · annual billing: 10 months for 12
      </p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {plan.limits.map((l) => (
          <li
            key={l}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
          >
            {l}
          </li>
        ))}
      </ul>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm leading-snug text-foreground/90">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-primary"
              aria-hidden
            />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className={
          plan.highlight
            ? "mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            : "mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted/50"
        }
      >
        {plan.cta}
      </Link>
    </article>
  );
}

export function PricingPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/login" className="text-base font-black tracking-tight">
            GetAxe
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground"
            >
              Try free
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Simple plans for Kenyan shops
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            POS, stock, credit and profit in one place. Start on a trial, pay
            monthly by M-Pesa when you are ready. No long contract.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <section className="mx-auto mt-14 max-w-3xl rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-lg font-bold">What every plan includes</h2>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/90 sm:grid-cols-2">
            {[
              "Cloud backup of your business data",
              "Updates as GetAxe improves",
              "WhatsApp support on paid plans",
              "Go-live checklist inside the app",
              "Multi-user permissions",
              "Cancel anytime — keep a data export path",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Setup (optional)</p>
            <p className="mt-1">
              Self-serve: free. Assisted remote go-live:{" "}
              <span className="font-semibold text-foreground">
                KES 10,000–25,000
              </span>
              . On-site / data migration: quoted per shop.
            </p>
            <p className="mt-3">
              Need more than five branches?{" "}
              <Link href="/login" className="font-semibold text-primary underline-offset-2 hover:underline">
                Contact us for Enterprise
              </Link>
              .
            </p>
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Prices in Kenyan Shillings, exclusive of VAT. Feature availability
          follows capabilities enabled for your business type.
        </p>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © GetAxe Technologies
      </footer>
    </div>
  );
}
