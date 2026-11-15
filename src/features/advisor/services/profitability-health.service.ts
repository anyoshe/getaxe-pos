import {
  RETAIL_EXPENSE_BENCHMARKS,
  TARGET_NET_MARGIN_PCT,
  classifyExpenseName,
  targetGrossMarginPct,
  type ExpenseBucket,
} from "./profitability-benchmarks";
import { listRecurringExpenses } from "@/features/finance/services/recurring-expenses.service";

export type BucketHealth = {
  bucket: ExpenseBucket;
  label: string;
  amount: number;
  pctOfRevenue: number | null;
  maxPct: number;
  idealMinPct: number;
  idealMaxPct: number;
  status: "ok" | "high" | "critical" | "unknown";
  message: string;
};

export type ProfitabilityHealth = {
  revenueMonth: number;
  grossProfitMonth: number;
  grossMarginPct: number | null;
  targetGrossMargin: { min: number; ideal: number };
  monthlyFixedTotal: number;
  /** GP − monthly fixed (proxy for contribution after fixed costs) */
  contributionAfterFixed: number;
  /** Approx net margin proxy: contribution / revenue */
  netMarginProxyPct: number | null;
  targetNetMargin: typeof TARGET_NET_MARGIN_PCT;
  overall: "healthy" | "tight" | "unhealthy" | "insufficient_data";
  overallReason: string;
  buckets: BucketHealth[];
  flags: string[];
};

function pct(part: number, whole: number): number | null {
  if (!(whole > 0)) return null;
  return Math.round((part / whole) * 1000) / 10;
}

function statusFor(
  pctOfRevenue: number | null,
  maxPct: number,
  idealMax: number,
): BucketHealth["status"] {
  if (pctOfRevenue == null) return "unknown";
  if (pctOfRevenue > maxPct * 1.25) return "critical";
  if (pctOfRevenue > maxPct) return "high";
  if (pctOfRevenue > idealMax) return "high";
  return "ok";
}

/**
 * Compare live month revenue / GP and monthly fixed templates to retail benchmarks.
 */
export async function buildProfitabilityHealth(input: {
  businessId: string;
  businessType: string | null;
  revenueMonth: number;
  grossProfitMonth: number;
}): Promise<ProfitabilityHealth> {
  const revenueMonth = Math.max(0, Number(input.revenueMonth) || 0);
  const grossProfitMonth = Number(input.grossProfitMonth) || 0;
  const targetGM = targetGrossMarginPct(input.businessType);

  let recurring: Awaited<ReturnType<typeof listRecurringExpenses>> = [];
  try {
    recurring = await listRecurringExpenses(input.businessId, {
      activeOnly: true,
    });
  } catch {
    recurring = [];
  }

  const byBucket: Record<ExpenseBucket, number> = {
    rent: 0,
    salaries: 0,
    utilities: 0,
    transport: 0,
    other: 0,
  };

  for (const r of recurring) {
    const b = classifyExpenseName(r.name, r.categoryName);
    byBucket[b] += r.amount;
  }

  const monthlyFixedTotal = Object.values(byBucket).reduce((a, b) => a + b, 0);
  const grossMarginPct = pct(grossProfitMonth, revenueMonth);
  const contributionAfterFixed = grossProfitMonth - monthlyFixedTotal;
  const netMarginProxyPct = pct(contributionAfterFixed, revenueMonth);

  const buckets: BucketHealth[] = RETAIL_EXPENSE_BENCHMARKS.map((bm) => {
    const amount = byBucket[bm.bucket];
    const p = pct(amount, revenueMonth);
    const st = statusFor(p, bm.maxPctOfRevenue, bm.idealMaxPct);
    let message = "No amount set for this bucket yet.";
    if (amount > 0 && p != null) {
      if (st === "ok") {
        message = `${p}% of sales — within ideal ${bm.idealMinPct}–${bm.idealMaxPct}% (max ${bm.maxPctOfRevenue}%).`;
      } else if (st === "high") {
        message = `${p}% of sales — above ideal; try to stay ≤ ${bm.maxPctOfRevenue}% of revenue.`;
      } else if (st === "critical") {
        message = `${p}% of sales — far above the ${bm.maxPctOfRevenue}% ceiling; this line is eating profit.`;
      }
    } else if (revenueMonth <= 0 && amount > 0) {
      message = `KES ${amount.toLocaleString()} planned, but no sales this month yet — cannot compute %.`;
    }
    return {
      bucket: bm.bucket,
      label: bm.label,
      amount,
      pctOfRevenue: p,
      maxPct: bm.maxPctOfRevenue,
      idealMinPct: bm.idealMinPct,
      idealMaxPct: bm.idealMaxPct,
      status: amount <= 0 ? "unknown" : st,
      message,
    };
  });

  const flags: string[] = [];
  if (revenueMonth <= 0) {
    flags.push("No completed sales revenue this calendar month — ratios are incomplete.");
  }
  if (monthlyFixedTotal <= 0) {
    flags.push(
      "No monthly fixed costs set (Finance → Expenses). Add rent, salaries, utilities to score the business.",
    );
  }
  if (grossMarginPct != null && grossMarginPct < targetGM.min) {
    flags.push(
      `Gross margin ${grossMarginPct}% is below the ${targetGM.min}% floor — pricing, cost prices, or mix are weak.`,
    );
  }
  for (const b of buckets) {
    if (b.status === "high" || b.status === "critical") {
      flags.push(`${b.label}: ${b.message}`);
    }
  }
  if (netMarginProxyPct != null && netMarginProxyPct < TARGET_NET_MARGIN_PCT.min) {
    flags.push(
      `After fixed costs, proxy net margin is ${netMarginProxyPct}% (target ≥ ${TARGET_NET_MARGIN_PCT.min}%).`,
    );
  }

  let overall: ProfitabilityHealth["overall"] = "insufficient_data";
  let overallReason = "Need monthly sales and fixed costs to judge profitability.";

  if (revenueMonth > 0 && monthlyFixedTotal > 0) {
    if (
      grossMarginPct != null &&
      grossMarginPct >= targetGM.min &&
      netMarginProxyPct != null &&
      netMarginProxyPct >= TARGET_NET_MARGIN_PCT.min &&
      buckets.every((b) => b.status === "ok" || b.status === "unknown" || b.amount === 0)
    ) {
      overall = "healthy";
      overallReason = `Gross margin and fixed-cost mix look sustainable (proxy net ~${netMarginProxyPct}% of sales).`;
    } else if (
      contributionAfterFixed > 0 &&
      (netMarginProxyPct == null || netMarginProxyPct >= 2)
    ) {
      overall = "tight";
      overallReason =
        "Still covering fixed costs from gross profit, but one or more lines are above healthy % of sales or margin is thin.";
    } else {
      overall = "unhealthy";
      overallReason =
        contributionAfterFixed <= 0
          ? "Gross profit this month does not cover monthly fixed costs — business is not covering its constant bills from trading profit."
          : "Fixed costs and/or margin are outside healthy bands.";
    }
  } else if (revenueMonth > 0 && monthlyFixedTotal <= 0) {
    overall = "insufficient_data";
    overallReason =
      "Sales exist but fixed costs are not set — cannot say if rent/salaries are too high.";
  }

  return {
    revenueMonth,
    grossProfitMonth,
    grossMarginPct,
    targetGrossMargin: targetGM,
    monthlyFixedTotal,
    contributionAfterFixed,
    netMarginProxyPct,
    targetNetMargin: TARGET_NET_MARGIN_PCT,
    overall,
    overallReason,
    buckets,
    flags,
  };
}

export function formatProfitabilityForPrompt(h: ProfitabilityHealth): string {
  return JSON.stringify(
    {
      overall: h.overall,
      overallReason: h.overallReason,
      revenueMonth: h.revenueMonth,
      grossProfitMonth: h.grossProfitMonth,
      grossMarginPct: h.grossMarginPct,
      targetGrossMarginPct: h.targetGrossMargin,
      monthlyFixedTotal: h.monthlyFixedTotal,
      contributionAfterFixed: h.contributionAfterFixed,
      netMarginProxyPct: h.netMarginProxyPct,
      targetNetMarginPct: h.targetNetMargin,
      expenseBuckets: h.buckets.map((b) => ({
        bucket: b.bucket,
        label: b.label,
        amount: b.amount,
        pctOfRevenue: b.pctOfRevenue,
        maxPctOfRevenue: b.maxPct,
        idealBand: `${b.idealMinPct}-${b.idealMaxPct}%`,
        status: b.status,
        message: b.message,
      })),
      flags: h.flags,
      note: "Benchmarks are % of SALES REVENUE (not net profit). Net is residual after COGS + expenses.",
    },
    null,
    2,
  );
}

export function formatProfitabilityOwnerAnswer(h: ProfitabilityHealth): string {
  const lines: string[] = [];
  lines.push(`**Profitability check** — ${h.overall.replace("_", " ")}`);
  lines.push(h.overallReason);
  lines.push("");
  lines.push(
    `Sales (month): **KES ${h.revenueMonth.toLocaleString()}** · Gross profit: **KES ${h.grossProfitMonth.toLocaleString()}**` +
      (h.grossMarginPct != null ? ` (**${h.grossMarginPct}%** margin)` : ""),
  );
  lines.push(
    `Target gross margin: **${h.targetGrossMargin.min}–${h.targetGrossMargin.ideal}%** of sales.`,
  );
  lines.push(
    `Monthly fixed costs: **KES ${h.monthlyFixedTotal.toLocaleString()}** · After fixed: **KES ${h.contributionAfterFixed.toLocaleString()}**` +
      (h.netMarginProxyPct != null
        ? ` (**${h.netMarginProxyPct}%** of sales; target ≥ ${h.targetNetMargin.min}%)`
        : ""),
  );
  lines.push("");
  lines.push("**Expense ceilings (% of sales revenue)**");
  for (const b of h.buckets) {
    if (b.amount <= 0) continue;
    const mark =
      b.status === "ok" ? "✓" : b.status === "high" ? "!" : b.status === "critical" ? "✗" : "·";
    lines.push(
      `- ${mark} **${b.label}**: KES ${b.amount.toLocaleString()}` +
        (b.pctOfRevenue != null ? ` = **${b.pctOfRevenue}%** of sales` : "") +
        ` (ideal ${b.idealMinPct}–${b.idealMaxPct}%, max ${b.maxPct})`,
    );
  }
  if (h.flags.length) {
    lines.push("");
    lines.push("**What needs attention**");
    for (const f of h.flags.slice(0, 8)) lines.push(`- ${f}`);
  }
  lines.push("");
  lines.push(
    "_Rule of thumb: rent ≤12% of sales, salaries ≤20% (product retail), utilities ≤4%, transport ≤5%. Healthy shops keep enough gross margin so fixed costs leave ≥5% net-style residual._",
  );
  return lines.join("\n");
}

export function parseProfitabilityIntent(q: string): boolean {
  const s = q.toLowerCase();
  return (
    /profitab|are we (making )?profit|is (the )?business (ok|healthy|profit)|expense (ratio|percent|%|allocation)|fixed cost|too much (on )?rent|salary (too|high)|break[- ]?even|healthy (margin|cost)/i.test(
      s,
    ) || /how (am i|are we) doing/.test(s)
  );
}
