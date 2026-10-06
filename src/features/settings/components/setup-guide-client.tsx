"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  BookOpen,
  Package,
  Warehouse,
  Wallet,
  ShoppingCart,
  Building2,
  AlertTriangle,
} from "lucide-react";

import type { SetupCheck } from "../services/setup-readiness.service";

type Step = {
  id: string;
  title: string;
  why: string;
  how: string[];
  href: string;
  hrefLabel: string;
  /** Match readiness check id when available */
  readinessId?: string;
  optional?: boolean;
};

type Phase = {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
};

function buildPhases(businessType: string | null): Phase[] {
  const type = (businessType ?? "OTHER").toUpperCase();
  const isPharmacy = [
    "PHARMACY",
    "CHEMIST",
    "CLINIC",
    "HOSPITAL",
    "LABORATORY",
    "OPTICAL",
  ].includes(type);
  const isHardware = [
    "HARDWARE",
    "ELECTRICAL",
    "ELECTRONICS",
    "PLUMBING",
    "BUILDING_MATERIALS",
    "PAINT",
  ].includes(type);
  const isAgrovet = ["AGROVET", "FARM_SUPPLIES"].includes(type);
  const isSpares = ["SPARE_PARTS", "GARAGE", "TYRE_CENTER"].includes(type);

  let productSteps: Step[] = [
    {
      id: "products-import",
      title: "Load products (Excel or manual)",
      why: "POS can only sell items that exist as product masters.",
      how: [
        "Open Products.",
        "Prefer Import Excel/CSV if you have a list (name, SKU, cost, sell, unit).",
        "Or use Starter kits for your trade, then import only the rest.",
        "Creating a product does NOT add warehouse quantity — that is the next phase.",
      ],
      href: "/inventory/products",
      hrefLabel: "Open Products",
      readinessId: "product",
    },
  ];

  if (isPharmacy) {
    productSteps = [
      {
        id: "pharmacy-catalogues",
        title: "Pharmacy catalogues & medicine starters",
        why: "Avoid typing every medicine. Load masters, then receive only what you stock.",
        how: [
          "Open Pharmacy catalogues.",
          "Ensure default catalogues (forms, drug categories, strengths) are loaded.",
          "Open starter medicines → select what you sell → Add selected.",
          "Import Excel for any SKU not in the starter list.",
        ],
        href: "/inventory/pharmacy-catalogues",
        hrefLabel: "Open Pharmacy catalogues",
        readinessId: "product",
      },
      {
        id: "products-review",
        title: "Review products & pharmacy fields",
        why: "Confirm SKU, units, batch/expiry flags, and suggested prices.",
        how: [
          "Open Products and spot-check 10 fast movers.",
          "Medicines that need batch/expiry must have those flags on.",
          "Fix packaging (strip/box factors) if you sell packs and pieces.",
        ],
        href: "/inventory/products",
        hrefLabel: "Open Products",
      },
    ];
  } else if (isHardware) {
    productSteps = [
      {
        id: "starter-hardware",
        title: "Hardware starter kit",
        why: "Bulk-create common building materials and tools without hand typing.",
        how: [
          "Open Starter kits (Hardware kit is shown for your business type).",
          "Select missing lines → Add selected.",
          "Import Excel for brand-specific or extra SKUs.",
        ],
        href: "/inventory/starter-kits",
        hrefLabel: "Open Starter kits",
        readinessId: "product",
      },
      {
        id: "products-review-hw",
        title: "Review products",
        why: "Confirm units (BAG, PCS, M, KG) and prices.",
        how: [
          "Open Products → verify sample lines.",
          "Set category markups under Categories if you price by % on cost.",
        ],
        href: "/inventory/products",
        hrefLabel: "Open Products",
      },
    ];
  } else if (isAgrovet) {
    productSteps = [
      {
        id: "starter-agrovet",
        title: "Agrovet starter kit",
        why: "Load fertilisers, feeds, animal health and farm tools quickly.",
        how: [
          "Open Starter kits → Agrovet.",
          "Select lines → Add selected.",
          "Import Excel for local brands not in the kit.",
        ],
        href: "/inventory/starter-kits",
        hrefLabel: "Open Starter kits",
        readinessId: "product",
      },
    ];
  } else if (isSpares) {
    productSteps = [
      {
        id: "starter-spares",
        title: "Motorbike & auto starter kits",
        why: "Parts and complete units without typing every filter and cable.",
        how: [
          "Open Starter kits → Motorbike and/or Auto.",
          "Add selected parts.",
          "Complete units are marked serialized — serials are captured when receiving stock.",
          "Import Excel for model-specific parts.",
        ],
        href: "/inventory/starter-kits",
        hrefLabel: "Open Starter kits",
        readinessId: "product",
      },
    ];
  } else {
    productSteps = [
      {
        id: "starter-or-excel",
        title: "Starter kits and/or Excel import",
        why: "General shops (fish depot, retail, other) usually load from Excel; kits are optional.",
        how: [
          "If your type is Other/Retail, Starter kits may show all kits — only add relevant lines, or skip.",
          "Best path for fish/food: Excel with name, SKU, unit (KG/PCS), cost, sell price.",
          "Open Products → Import → validate → import.",
          "Then open Categories to set markups if you use cost-plus pricing.",
        ],
        href: "/inventory/products",
        hrefLabel: "Open Products / import",
        readinessId: "product",
      },
      {
        id: "starter-optional",
        title: "Optional: industry starter kits",
        why: "Only if some hardware/agrovet lines apply to your shop.",
        how: ["Open Starter kits and add only what you actually sell."],
        href: "/inventory/starter-kits",
        hrefLabel: "Open Starter kits",
        optional: true,
      },
    ];
  }

  return [
    {
      id: "phase-1",
      title: "Phase 1 — Account & business identity",
      summary: "Confirm who you are in the system before loading stock.",
      steps: [
        {
          id: "business-profile",
          title: "Business profile",
          why: "Legal name, contacts, and business type drive menus and starter kits.",
          how: [
            "Open Business profile.",
            "Confirm business type is correct (Pharmacy, Hardware, Agrovet, Other…).",
            "Wrong type shows the wrong starter kit — fix type before bulk-loading products.",
          ],
          href: "/settings/business",
          hrefLabel: "Open Business profile",
          readinessId: "profile",
        },
        {
          id: "capabilities",
          title: "Capabilities (features on/off)",
          why: "Turn on only what you need (batches, serials, pharmacy). Avoid enabling everything on day one.",
          how: [
            "Open Capabilities.",
            "Pharmacy: medicine catalogue / core as needed.",
            "Spares with bikes: serial numbers.",
            "Medicines/chemicals: batch and expiry.",
          ],
          href: "/settings/capabilities",
          hrefLabel: "Open Capabilities",
          optional: true,
        },
        {
          id: "security",
          title: "Change password / security",
          why: "Do not keep the temporary invitation password.",
          how: ["Open Security and set a password only you and trusted admins know."],
          href: "/settings/security",
          hrefLabel: "Open Security",
          optional: true,
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2 — Locations, units & people",
      summary: "Foundation for stock and POS. Do this before products.",
      steps: [
        {
          id: "branches",
          title: "Branches",
          why: "Sales and stock attach to a branch.",
          how: [
            "Open Branches.",
            "Create at least Main / Head office if missing.",
            "Note the branch you will use on POS.",
          ],
          href: "/settings/branches",
          hrefLabel: "Open Branches",
          readinessId: "branch",
        },
        {
          id: "warehouses",
          title: "Warehouses",
          why: "All stock lives in a warehouse. POS sells from a selected warehouse.",
          how: [
            "Open Warehouses.",
            "Create Main Warehouse and link it to your branch if prompted.",
            "Use this warehouse for opening stock and POS.",
          ],
          href: "/settings/warehouses",
          hrefLabel: "Open Warehouses",
          readinessId: "warehouse",
        },
        {
          id: "units",
          title: "Units of measure",
          why: "Buy, stock, and sell units must exist (PCS, BOX, KG, TAB…).",
          how: [
            "Open Units.",
            "Add any unit your Excel or suppliers use that is missing.",
            "Later, packaging on a product says how many stock units are in one box.",
          ],
          href: "/settings/units",
          hrefLabel: "Open Units",
          readinessId: "units",
        },
        {
          id: "users",
          title: "Users & roles",
          why: "Cashiers need POS rights; admin keeps full control.",
          how: [
            "Open Users — invite cashiers.",
            "Open Roles if you need extra permissions on a role or user.",
          ],
          href: "/settings/users",
          hrefLabel: "Open Users",
          optional: true,
        },
        {
          id: "numbering",
          title: "Document numbering",
          why: "Cash sale vs invoice prefixes keep paid and credit documents clear.",
          how: [
            "Open Numbering.",
            "Set cash sale and invoice sequences if not already set.",
          ],
          href: "/settings/numbering",
          hrefLabel: "Open Numbering",
          optional: true,
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Cash tills & opening money",
      summary: "Money channels POS will use, plus cash you already held.",
      steps: [
        {
          id: "cash-accounts",
          title: "Cash & bank accounts (tills)",
          why: "Every payment method needs a till/account so drawers stay truthful.",
          how: [
            "Open Cash & bank.",
            "Ensure Main Cash, M-Pesa, Bank, Card (as you use them) exist.",
            "Prefer separate ledger accounts per till type (readiness checks this).",
            "Add bank name / till number details so staff know where money sits.",
          ],
          href: "/finance/cash-accounts",
          hrefLabel: "Open Cash & bank",
          readinessId: "cash",
        },
        {
          id: "opening-cash",
          title: "Opening cash balances",
          why: "Existing shops already had money before GetAxe — record it once.",
          how: [
            "Open Opening balances.",
            "Enter amounts already in each till (cash, M-Pesa, bank).",
            "Save so journals/balance sheet start from truth.",
          ],
          href: "/finance/opening-balances",
          hrefLabel: "Open Opening balances",
        },
        {
          id: "payment-methods",
          title: "Payment methods",
          why: "POS tender options should match how customers pay.",
          how: ["Open Payment methods and confirm cash, M-Pesa, card, bank as needed."],
          href: "/settings/payment-methods",
          hrefLabel: "Open Payment methods",
          optional: true,
        },
      ],
    },
    {
      id: "phase-4",
      title: "Phase 4 — Products (catalogue only)",
      summary: "Product masters. Still no warehouse quantity until Phase 5.",
      steps: productSteps.concat([
        {
          id: "categories-markup",
          title: "Categories & markups",
          why: "Optional cost-plus pricing so sell price tracks average cost.",
          how: [
            "Open Categories.",
            "Set retail markup % (and wholesale if used).",
            "Use Product prices to preview cost → markup → sell and apply.",
          ],
          href: "/inventory/categories",
          hrefLabel: "Open Categories",
          optional: true,
        },
        {
          id: "product-prices",
          title: "Product prices",
          why: "Confirm POS will not sell at cost or blank price.",
          how: [
            "Open Product prices.",
            "Check cost, markup, and selling price on key items.",
            "Edit individual prices where category markup is not enough.",
          ],
          href: "/inventory/product-prices",
          hrefLabel: "Open Product prices",
        },
      ]),
    },
    {
      id: "phase-5",
      title: "Phase 5 — Stock into the warehouse",
      summary: "This is the step most people skip — without it POS shows no stock.",
      steps: [
        {
          id: "opening-stock",
          title: "Opening stock (stock you already own)",
          why: "Existing businesses load quantities they already have — not a fake purchase order.",
          how: [
            "Products must exist first (Phase 4).",
            "Prepare Excel: sku, warehouse (e.g. MAIN), quantity, unit, unitCost.",
            "Add batchNumber, manufactureDate, expiryDate for medicines/chemicals.",
            "Add serialNumbers (use | between serials) for serialized units.",
            "Open Stock receive / opening stock import → validate → receive once (do not double-click).",
            "Verify quantities under Stock on hand.",
          ],
          href: "/inventory/stock/receive",
          hrefLabel: "Open Stock receive",
          readinessId: "stock",
        },
        {
          id: "stock-on-hand",
          title: "Verify stock on hand",
          why: "Confirm system matches physical shelves for at least 10 key items.",
          how: [
            "Open Stock.",
            "Search 10 fast movers and compare to physical count.",
            "Fix via adjustment only if your process allows — prefer correct opening stock first.",
          ],
          href: "/inventory/stock",
          hrefLabel: "Open Stock on hand",
        },
        {
          id: "suppliers-po",
          title: "Suppliers & new purchases (optional on day one)",
          why: "For stock bought after go-live: PO → GRN → supplier invoice → pay from till.",
          how: [
            "Create Suppliers.",
            "Create Purchase order in the unit you buy; cost is per that unit.",
            "Approve → Receive (GRN) with batch/serials if required.",
            "Pay supplier invoice choosing the correct cash/bank account.",
          ],
          href: "/purchases/orders",
          hrefLabel: "Open Purchase orders",
          readinessId: "supplier",
          optional: true,
        },
      ],
    },
    {
      id: "phase-6",
      title: "Phase 6 — Test sale & go live",
      summary: "Prove the full loop before staff rely on the system.",
      steps: [
        {
          id: "readiness-score",
          title: "Go-live readiness score",
          why: "Live checklist of required system items.",
          how: [
            "Open Go-live readiness.",
            "Complete every required item until score is acceptable.",
            "Return here if you need the detailed how-to for a step.",
          ],
          href: "/settings/readiness",
          hrefLabel: "Open Go-live readiness",
        },
        {
          id: "test-pos",
          title: "Test cash sale on POS",
          why: "Confirms product, price, stock, and till all work together.",
          how: [
            "Open POS.",
            "Select the warehouse that has stock.",
            "Add one item with quantity available.",
            "Complete a small Cash sale.",
            "Check: invoice appears, stock reduced, till increased.",
          ],
          href: "/sales/pos",
          hrefLabel: "Open POS",
          readinessId: "sale",
        },
        {
          id: "staff-sop",
          title: "Staff SOP at the till",
          why: "Daily habits after setup so the system stays truthful.",
          how: [
            "Open Staff SOP and print or bookmark it.",
            "Train cashiers: warehouse, cash vs credit, batch/serial when prompted, end-of-day recon.",
          ],
          href: "/settings/staff-sop",
          hrefLabel: "Open Staff SOP",
          optional: true,
        },
        {
          id: "recon",
          title: "Daily reconciliation (after first real day)",
          why: "Count each tender channel against system expected close.",
          how: ["Open Daily reconciliation and count cash, M-Pesa, card, bank as used."],
          href: "/finance/reconciliation",
          hrefLabel: "Open Reconciliation",
          optional: true,
        },
      ],
    },
  ];
}

function stepDone(
  step: Step,
  checksById: Map<string, SetupCheck>,
): boolean | null {
  if (!step.readinessId) return null;
  const c = checksById.get(step.readinessId);
  if (!c) return null;
  return c.done;
}

export function SetupGuideClient({
  businessName,
  businessType,
  score,
  checks,
  requiredDone,
  requiredTotal,
}: {
  businessName: string | null;
  businessType: string | null;
  score: number;
  checks: SetupCheck[];
  requiredDone: number;
  requiredTotal: number;
}) {
  const phases = buildPhases(businessType);
  const checksById = new Map(checks.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Settings
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Business setup guide
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Step-by-step path for an existing shop until you are ready to sell
            on POS. Follow phases in order. Each step tells you{" "}
            <strong className="text-foreground">where to go</strong> in the app
            and what to do there.
          </p>
          {(businessName || businessType) && (
            <p className="mt-2 text-sm">
              {businessName ? (
                <span className="font-medium">{businessName}</span>
              ) : null}
              {businessType ? (
                <span className="text-muted-foreground">
                  {" "}
                  · type{" "}
                  <span className="font-medium text-foreground">
                    {businessType}
                  </span>
                </span>
              ) : null}
            </p>
          )}
        </div>
        <div className="rounded-2xl border bg-card px-5 py-4 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-primary">
            {score}%
          </div>
          <div className="text-xs text-muted-foreground">
            Readiness {requiredDone}/{requiredTotal} required
          </div>
          <Link
            href="/settings/readiness"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            Open live checklist
          </Link>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
          <div>
            <p className="font-medium">Do not type every product by hand</p>
            <p className="mt-1 text-muted-foreground">
              Use starter kits / pharmacy catalogues and Excel import. Product
              masters come first; warehouse quantities come from{" "}
              <strong className="text-foreground">opening stock</strong> or{" "}
              <strong className="text-foreground">GRN</strong>. Until stock is
              loaded, POS will correctly show little or no stock.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <Building2 className="h-3.5 w-3.5" /> Identity
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <Warehouse className="h-3.5 w-3.5" /> Locations
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <Wallet className="h-3.5 w-3.5" /> Cash
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <Package className="h-3.5 w-3.5" /> Products
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <Warehouse className="h-3.5 w-3.5" /> Stock
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
          <ShoppingCart className="h-3.5 w-3.5" /> Test sale
        </span>
      </div>

      {phases.map((phase, pi) => (
        <section
          key={phase.id}
          className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm sm:p-6"
        >
          <header className="border-b pb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Phase {pi + 1} of {phases.length}
            </p>
            <h2 className="text-lg font-semibold tracking-tight">
              {phase.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{phase.summary}</p>
          </header>

          <ol className="space-y-4">
            {phase.steps.map((step, si) => {
              const done = stepDone(step, checksById);
              return (
                <li
                  key={step.id}
                  className="rounded-xl border border-border/80 bg-background/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        {done === true ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        ) : done === false ? (
                          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                        ) : (
                          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {si + 1}. {step.title}
                            {step.optional ? (
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                optional
                              </span>
                            ) : null}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                              Why:{" "}
                            </span>
                            {step.why}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pl-7">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          How — do this in order
                        </p>
                        <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm">
                          {step.how.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <Link
                      href={step.href}
                      className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      {step.hrefLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
        <h2 className="text-lg font-semibold">You are ready to sell when</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Branch and warehouse exist</li>
          <li>Products you sell this week exist with sell prices</li>
          <li>Stock on hand shows quantity for those products</li>
          <li>Cash tills exist (opening cash recorded if you already held money)</li>
          <li>One test cash sale reduced stock and increased the till</li>
          <li>Go-live readiness required items are complete</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/settings/readiness"
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            Re-check readiness
          </Link>
          <Link
            href="/sales/pos"
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open POS
          </Link>
          <Link
            href="/settings/staff-sop"
            className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            Staff SOP
          </Link>
        </div>
      </section>
    </div>
  );
}
