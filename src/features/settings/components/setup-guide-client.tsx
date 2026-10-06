"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  List,
  Sparkles,
} from "lucide-react";

import type { SetupCheck } from "../services/setup-readiness.service";

type Step = {
  id: string;
  title: string;
  why: string;
  how: string[];
  href: string;
  hrefLabel: string;
  readinessId?: string;
  optional?: boolean;
};

type Phase = {
  id: string;
  title: string;
  summary: string;
  steps: Step[];
};

type FlatStep = Step & {
  phaseId: string;
  phaseTitle: string;
  phaseIndex: number;
  stepIndexInPhase: number;
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
          how: [
            "Open Security and set a password only you and trusted admins know.",
          ],
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
            "Open Users / Roles.",
            "Create cashier accounts with POS permissions only if needed.",
            "You can adjust extra permissions per user when editing them.",
          ],
          href: "/settings/users",
          hrefLabel: "Open Users",
          optional: true,
        },
      ],
    },
    {
      id: "phase-3",
      title: "Phase 3 — Cash, tax & numbering",
      summary: "Money channels and document numbers before first sale.",
      steps: [
        {
          id: "cash-tills",
          title: "Cash & bank accounts (tills)",
          why: "POS payments and supplier payouts post to these drawers.",
          how: [
            "Open Cash & bank.",
            "Ensure Cash, M-Pesa, bank (and others you use) exist.",
            "Each till should map to a different ledger account when possible.",
          ],
          href: "/finance/cash-accounts",
          hrefLabel: "Open Cash & bank",
          readinessId: "cash",
        },
        {
          id: "opening-cash",
          title: "Opening cash balances",
          why: "Money you already held before GetAxe must be recorded so reports stay true.",
          how: [
            "Open Opening balances.",
            "Enter starting amounts per till you already had.",
            "Save so journals post correctly.",
          ],
          href: "/finance/opening-balances",
          hrefLabel: "Open Opening balances",
          optional: true,
        },
        {
          id: "tax",
          title: "Tax rates (if you charge VAT)",
          why: "Invoices need the correct rate when tax is enabled.",
          how: [
            "Open tax / finance settings and confirm rates for your business.",
          ],
          href: "/settings/business",
          hrefLabel: "Open Business / tax",
          readinessId: "tax",
          optional: true,
        },
        {
          id: "numbering",
          title: "Document numbering",
          why: "Cash sales and credit invoices can use different prefixes.",
          how: [
            "Open Numbering.",
            "Set cash sale and invoice prefixes if you use both modes.",
          ],
          href: "/settings/numbering",
          hrefLabel: "Open Numbering",
          optional: true,
        },
      ],
    },
    {
      id: "phase-4",
      title: "Phase 4 — Products & prices",
      summary: "Catalogue first. Quantities come in the next phase.",
      steps: productSteps.concat([
        {
          id: "categories-markup",
          title: "Categories & markups (optional)",
          why: "Cost-plus pricing by category speeds sell prices after GRN.",
          how: [
            "Open Categories.",
            "Set retail (and wholesale) markup % where you use cost-plus.",
            "Apply markup to prices, or edit individual product prices.",
          ],
          href: "/inventory/categories",
          hrefLabel: "Open Categories",
          optional: true,
        },
        {
          id: "product-prices",
          title: "Confirm sell prices",
          why: "POS must sell above cost unless you intentionally discount.",
          how: [
            "Open Product prices.",
            "Check cost, markup, and sell for fast movers.",
            "Fix any line still at zero or at cost if that is not intended.",
          ],
          href: "/inventory/product-prices",
          hrefLabel: "Open Product prices",
          optional: true,
        },
      ]),
    },
    {
      id: "phase-5",
      title: "Phase 5 — Opening stock & suppliers",
      summary: "Put quantities into warehouses so POS can sell.",
      steps: [
        {
          id: "opening-stock",
          title: "Opening stock (existing shop)",
          why: "Products without quantity cannot be sold from stock.",
          how: [
            "Open Receive stock or Opening stock import.",
            "Use Excel: SKU, warehouse (MAIN), quantity, unit, unit cost, batch/expiry if required.",
            "Serialized units: list serials with | between values.",
            "After import, open Stock on hand and verify counts.",
          ],
          href: "/inventory/stock/receive",
          hrefLabel: "Open Receive / opening stock",
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
          how: [
            "Open Daily reconciliation and count cash, M-Pesa, card, bank as used.",
          ],
          href: "/finance/reconciliation",
          hrefLabel: "Open Reconciliation",
          optional: true,
        },
      ],
    },
  ];
}

function flattenPhases(phases: Phase[]): FlatStep[] {
  const out: FlatStep[] = [];
  phases.forEach((phase, phaseIndex) => {
    phase.steps.forEach((step, stepIndexInPhase) => {
      out.push({
        ...step,
        phaseId: phase.id,
        phaseTitle: phase.title,
        phaseIndex,
        stepIndexInPhase,
      });
    });
  });
  return out;
}

const MANUAL_DONE_KEY = "getaxe-setup-wizard-manual-done";

function readManualDone(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MANUAL_DONE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeManualDone(map: Record<string, boolean>) {
  try {
    localStorage.setItem(MANUAL_DONE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function stepDone(
  step: Step,
  checksById: Map<string, SetupCheck>,
  manualDone: Record<string, boolean>,
): boolean | null {
  if (step.readinessId) {
    const c = checksById.get(step.readinessId);
    if (!c) return null;
    return c.done;
  }
  if (manualDone[step.id]) return true;
  return null;
}

function GuideHeader({
  businessName,
  businessType,
  score,
  requiredDone,
  requiredTotal,
  mode,
  onMode,
}: {
  businessName: string | null;
  businessType: string | null;
  score: number;
  requiredDone: number;
  requiredTotal: number;
  mode: "wizard" | "list";
  onMode: (m: "wizard" | "list") => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Business setup wizard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Follow one step at a time until you are ready to sell. Completed steps
          show a green check from live system data (or when you mark a manual
          step done).
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
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMode("wizard")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${
              mode === "wizard"
                ? "bg-primary text-primary-foreground"
                : "border bg-background hover:bg-muted"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Step-by-step wizard
          </button>
          <button
            type="button"
            onClick={() => onMode("list")}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${
              mode === "list"
                ? "bg-primary text-primary-foreground"
                : "border bg-background hover:bg-muted"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            Full guide list
          </button>
        </div>
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
  );
}

function ProgressBar({ score }: { score: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, score)}%` }}
      />
    </div>
  );
}

function TipBanner() {
  return (
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
  );
}

function ReadyWhenSection() {
  return (
    <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
      <h2 className="text-lg font-semibold">You are ready to sell when</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        <li>Branch and warehouse exist</li>
        <li>Products you sell this week exist with sell prices</li>
        <li>Stock on hand shows quantity for those products</li>
        <li>
          Cash tills exist (opening cash recorded if you already held money)
        </li>
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
  );
}

export function SetupGuideClient({
  businessName,
  businessType,
  score,
  checks,
  requiredDone,
  requiredTotal,
  initialMode = "wizard",
}: {
  businessName: string | null;
  businessType: string | null;
  score: number;
  checks: SetupCheck[];
  requiredDone: number;
  requiredTotal: number;
  initialMode?: "wizard" | "list";
}) {
  const phases = useMemo(() => buildPhases(businessType), [businessType]);
  const flatSteps = useMemo(() => flattenPhases(phases), [phases]);
  const checksById = useMemo(
    () => new Map(checks.map((c) => [c.id, c])),
    [checks],
  );

  const [mode, setMode] = useState<"wizard" | "list">(initialMode);
  const [manualDone, setManualDone] = useState<Record<string, boolean>>({});
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setManualDone(readManualDone());
    setHydrated(true);
  }, []);

  const isDone = useCallback(
    (step: Step): boolean | null => stepDone(step, checksById, manualDone),
    [checksById, manualDone],
  );

  useEffect(() => {
    if (!hydrated) return;
    const firstIncomplete = flatSteps.findIndex((s) => {
      const d = stepDone(s, checksById, manualDone);
      if (d === true) return false;
      if (s.optional && d === null) return false;
      return true;
    });
    if (firstIncomplete >= 0) setIndex(firstIncomplete);
    else setIndex(Math.max(0, flatSteps.length - 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on first hydrate
  }, [hydrated]);

  const current = flatSteps[index] ?? flatSteps[0];
  const total = flatSteps.length;
  const doneCount = flatSteps.filter((s) => isDone(s) === true).length;
  const wizardPct = total === 0 ? 100 : Math.round((doneCount / total) * 100);

  const markManualDone = (stepId: string) => {
    setManualDone((prev) => {
      const next = { ...prev, [stepId]: true };
      writeManualDone(next);
      return next;
    });
  };

  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const jumpToNextIncomplete = () => {
    const next = flatSteps.findIndex(
      (s, i) => i > index && isDone(s) !== true,
    );
    if (next >= 0) setIndex(next);
    else goNext();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <GuideHeader
        businessName={businessName}
        businessType={businessType}
        score={score}
        requiredDone={requiredDone}
        requiredTotal={requiredTotal}
        mode={mode}
        onMode={setMode}
      />

      <ProgressBar score={mode === "wizard" ? wizardPct : score} />

      <TipBanner />

      {mode === "wizard" && current ? (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1.5">
              {flatSteps.map((s, i) => {
                const d = isDone(s);
                const active = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    title={`${s.title}${s.optional ? " (optional)" : ""}`}
                    onClick={() => setIndex(i)}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : d === true
                          ? "border-emerald-600/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d === true ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Step {index + 1} of {total}
            {current.optional ? " · optional" : ""} · wizard progress{" "}
            {wizardPct}% ({doneCount} done)
          </p>

          <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {current.phaseTitle}
            </p>
            <div className="mt-2 flex items-start gap-3">
              {isDone(current) === true ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              ) : isDone(current) === false ? (
                <Circle className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground" />
              ) : (
                <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold tracking-tight">
                  {current.title}
                </h2>
                {isDone(current) === true ? (
                  <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Completed — system data confirms this step (or you marked it
                    done).
                  </p>
                ) : isDone(current) === false ? (
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Not complete yet — finish the actions below, then return
                    here (refresh) to see the check update.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No automatic check for this step — open the screen, do the
                    work, then mark done or continue.
                  </p>
                )}
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Why: </span>
                  {current.why}
                </p>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    How — do this in order
                  </p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
                    {current.how.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
              <Link
                href={current.href}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {current.hrefLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!current.readinessId && isDone(current) !== true ? (
                <button
                  type="button"
                  onClick={() => {
                    markManualDone(current.id);
                    jumpToNextIncomplete();
                  }}
                  className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                >
                  Mark done & next
                </button>
              ) : null}
              {isDone(current) === true ? (
                <button
                  type="button"
                  onClick={jumpToNextIncomplete}
                  className="inline-flex h-10 items-center rounded-lg border border-emerald-600/40 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-800 dark:text-emerald-300"
                >
                  Next incomplete step
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              disabled={index <= 0}
              onClick={goPrev}
              className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              disabled={index >= total - 1}
              onClick={goNext}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-40"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {wizardPct >= 100 || score >= 100 ? (
            <div className="rounded-xl border border-emerald-600/30 bg-emerald-500/10 p-4 text-sm">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                Setup looks complete
              </p>
              <p className="mt-1 text-muted-foreground">
                Required readiness is at {score}%. Run a final test sale if you
                have not already.
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
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
                <p className="mt-1 text-sm text-muted-foreground">
                  {phase.summary}
                </p>
              </header>

              <ol className="space-y-4">
                {phase.steps.map((step, si) => {
                  const done = isDone(step);
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
                                {done === true ? (
                                  <span className="ml-2 text-xs font-medium text-emerald-600">
                                    Done
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
        </div>
      )}

      <ReadyWhenSection />
    </div>
  );
}
