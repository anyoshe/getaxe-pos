/**
 * SME retail / pharmacy / spare profitability guardrails.
 *
 * Industry practice allocates fixed costs as a **% of sales revenue**, not of
 * net profit (net is the residual after costs). Sources aligned with common
 * SMB and Kenya retail guidance: rent ~5–12%, payroll leaner in product retail,
 * target net margin after COGS + opex.
 *
 * Used by the advisor and owner brief — not hard accounting rules.
 */

export type ExpenseBucket =
  | "rent"
  | "salaries"
  | "utilities"
  | "transport"
  | "other";

export type BucketBenchmark = {
  bucket: ExpenseBucket;
  label: string;
  /** Soft max % of monthly revenue considered healthy */
  maxPctOfRevenue: number;
  /** Ideal band low */
  idealMinPct: number;
  idealMaxPct: number;
  matchNames: string[]; // lowercase substrings for category/name matching
};

/** Default guardrails for Kenyan product retail (chemist, spare, duka, hardware). */
export const RETAIL_EXPENSE_BENCHMARKS: BucketBenchmark[] = [
  {
    bucket: "rent",
    label: "Rent / occupancy",
    maxPctOfRevenue: 12,
    idealMinPct: 5,
    idealMaxPct: 10,
    matchNames: ["rent", "lease", "occupancy", "premises", "shop rent"],
  },
  {
    bucket: "salaries",
    label: "Salaries / wages",
    maxPctOfRevenue: 20,
    idealMinPct: 8,
    idealMaxPct: 18,
    matchNames: [
      "salary",
      "salaries",
      "wage",
      "wages",
      "payroll",
      "staff",
      "labour",
      "labor",
    ],
  },
  {
    bucket: "utilities",
    label: "Utilities",
    maxPctOfRevenue: 4,
    idealMinPct: 1,
    idealMaxPct: 3,
    matchNames: [
      "utilit",
      "electric",
      "power",
      "water",
      "internet",
      "wifi",
      "token",
    ],
  },
  {
    bucket: "transport",
    label: "Transport / logistics",
    maxPctOfRevenue: 5,
    idealMinPct: 1,
    idealMaxPct: 4,
    matchNames: ["transport", "fuel", "delivery", "logistics", "boda", "courier"],
  },
  {
    bucket: "other",
    label: "Other fixed / operating",
    maxPctOfRevenue: 8,
    idealMinPct: 2,
    idealMaxPct: 6,
    matchNames: [], // residual
  },
];

/** Gross margin (GP / revenue) targets by vertical hint. */
export function targetGrossMarginPct(businessType: string | null): {
  min: number;
  ideal: number;
} {
  const t = (businessType || "").toUpperCase();
  if (t.includes("PHARMACY") || t.includes("CHEMIST")) {
    return { min: 22, ideal: 30 };
  }
  if (t.includes("SPARE") || t.includes("AUTO") || t.includes("HARDWARE")) {
    return { min: 20, ideal: 28 };
  }
  if (t.includes("RESTAURANT") || t.includes("HOTEL")) {
    return { min: 55, ideal: 65 };
  }
  // general retail / duka
  return { min: 18, ideal: 25 };
}

/** Net margin target after COGS + operating (healthy SME retail). */
export const TARGET_NET_MARGIN_PCT = { min: 5, ideal: 12 };

export function classifyExpenseName(
  name: string,
  categoryName?: string | null,
): Exclude<ExpenseBucket, never> {
  const hay = `${name} ${categoryName || ""}`.toLowerCase();
  for (const b of RETAIL_EXPENSE_BENCHMARKS) {
    if (b.bucket === "other") continue;
    if (b.matchNames.some((m) => hay.includes(m))) return b.bucket;
  }
  return "other";
}
