import {
  buildBusinessAdvisorContext,
  formatContextForPrompt,
  type BusinessAdvisorContext,
} from "./business-context.service";

export type AdvisorReply = {
  answer: string;
  provider: "xai" | "groq" | "heuristic" | "none";
  actions: { label: string; href: string }[];
  remainingToday: number;
};

/** Soft free tier: later raise or bill when clients buy more messages. */
const FREE_DAILY_LIMIT = 15;

const usageByDay = new Map<string, { day: string; count: number }>();

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function usageKey(businessId: string) {
  return `${businessId}:${dayKey()}`;
}

export function getAdvisorRemaining(businessId: string): number {
  const u = usageByDay.get(usageKey(businessId));
  if (!u || u.day !== dayKey()) return FREE_DAILY_LIMIT;
  return Math.max(0, FREE_DAILY_LIMIT - u.count);
}

function consumeUsage(businessId: string): number {
  const key = usageKey(businessId);
  const day = dayKey();
  const cur = usageByDay.get(key);
  if (!cur || cur.day !== day) {
    usageByDay.set(key, { day, count: 1 });
    return FREE_DAILY_LIMIT - 1;
  }
  cur.count += 1;
  return Math.max(0, FREE_DAILY_LIMIT - cur.count);
}

function money(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

function marginPct(profit: number, revenue: number) {
  if (revenue <= 0) return null;
  return ((profit / revenue) * 100).toFixed(1);
}

/** Ranked issues from live data — drives narrative advice. */
function diagnose(ctx: BusinessAdvisorContext) {
  const issues: {
    priority: number;
    id: string;
    headline: string;
    detail: string;
    action: string;
  }[] = [];

  if (ctx.lowStockCount > 0) {
    const names = ctx.lowStockNames.slice(0, 4).join(", ");
    issues.push({
      priority: 10 + Math.min(ctx.lowStockCount, 20),
      id: "restock",
      headline: `${ctx.lowStockCount} product(s) need restocking`,
      detail: names
        ? `Examples: ${names}${ctx.lowStockNames.length > 4 ? "…" : ""}. Stock-outs mean lost sales even if cash looks healthy.`
        : "Items are at or below reorder level.",
      action:
        "Open Restock, adjust quantities, and create a purchase order before customers walk away empty-handed.",
    });
  }

  if (ctx.losses.length > 0) {
    const names = ctx.losses
      .slice(0, 3)
      .map((p) => `${p.name} (${money(p.margin)})`)
      .join("; ");
    issues.push({
      priority: 25,
      id: "loss",
      headline: "Some products are selling below cost",
      detail: `Loss lines this month: ${names}. Every unit sold on these reduces gross profit.`,
      action:
        "Raise selling price, stop deep discounts, or pause promoting those SKUs until margin is positive.",
    });
  }

  if (ctx.expiring.length > 0) {
    const names = ctx.expiring
      .slice(0, 3)
      .map((e) => `${e.name} (exp ${e.expiryDate})`)
      .join("; ");
    issues.push({
      priority: 22,
      id: "expiry",
      headline: "Stock approaching expiry",
      detail: names,
      action:
        "Sell these first at the counter (FEFO), run a short promotion, or write off what will not move — don’t reorder the same lines yet.",
    });
  }

  if (ctx.slowStock.length > 0) {
    const names = ctx.slowStock
      .slice(0, 4)
      .map((s) => s.name)
      .join(", ");
    issues.push({
      priority: 12,
      id: "slow",
      headline: "Capital sitting in slow-moving stock",
      detail: `${names} show little or no sales in the last ~30 days while still holding quantity.`,
      action:
        "Avoid reordering these; consider bundling or discounting to free shelf space and cash.",
    });
  }

  if (ctx.openAr > 0) {
    issues.push({
      priority: 18,
      id: "ar",
      headline: `Customers owe you ${money(ctx.openAr)}`,
      detail:
        "Open credit invoices tie up cash that could fund restocking or expenses.",
      action: "Work Sales → Receivables: call or collect the oldest balances first.",
    });
  }

  if (ctx.openAp > 0) {
    issues.push({
      priority: 14,
      id: "ap",
      headline: `You owe suppliers ${money(ctx.openAp)}`,
      detail: "Unpaid supplier invoices can interrupt supply of your best sellers.",
      action:
        "Schedule payments from the right till (Cash & bank) so priority lines keep flowing.",
    });
  }

  if (ctx.salesToday === 0 && ctx.salesTodayCount === 0) {
    issues.push({
      priority: 8,
      id: "sales_today",
      headline: "No completed sales recorded today yet",
      detail: `Month gross profit is still ${money(ctx.grossProfitMonth)} — the business has been making money, but today is quiet in the system so far.`,
      action:
        "If the shop is trading, ensure POS sales are completed so live dashboards stay true. Push high-margin lines from your top profit list.",
    });
  }

  if (
    ctx.revenueMonth > 0 &&
    ctx.grossProfitMonth > 0 &&
    ctx.grossProfitMonth / ctx.revenueMonth < 0.15
  ) {
    issues.push({
      priority: 16,
      id: "thin_margin",
      headline: "Gross margin this month is relatively thin",
      detail: `About ${marginPct(ctx.grossProfitMonth, ctx.revenueMonth)}% gross margin (${money(ctx.grossProfitMonth)} on ${money(ctx.revenueMonth)} sales).`,
      action:
        "Protect top-profit products’ prices and stock; fix any loss-makers before adding more discount promotions.",
    });
  }

  issues.sort((a, b) => b.priority - a.priority);
  return issues;
}

function narrativeImprove(ctx: BusinessAdvisorContext): string {
  const issues = diagnose(ctx);
  const pct = marginPct(ctx.grossProfitMonth, ctx.revenueMonth);
  const parts: string[] = [];

  parts.push(
    `Here’s a straight read of your business from live GetAxe numbers (as of ${new Date(ctx.asOf).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}).`,
  );
  parts.push("");

  // Snapshot in prose
  const snap: string[] = [];
  snap.push(
    `This month you’ve recorded about ${money(ctx.revenueMonth)} in sales revenue with ${money(ctx.grossProfitMonth)} gross profit` +
      (pct ? ` (roughly ${pct}% margin)` : "") +
      `.`,
  );
  snap.push(
    `Cash and bank across tills sit at ${money(ctx.cashTotal)}; inventory at cost is about ${money(ctx.stockValue)}.`,
  );
  if (ctx.salesToday > 0) {
    snap.push(
      `Today so far: ${money(ctx.salesToday)} across ${ctx.salesTodayCount} sale(s).`,
    );
  } else {
    snap.push(`Today’s completed sales in the system are still ${money(0)}.`);
  }
  parts.push(snap.join(" "));
  parts.push("");

  if (ctx.topProfit.length > 0) {
    parts.push(
      `Your strongest profit contributors this month include ${ctx.topProfit
        .slice(0, 3)
        .map((p) => `${p.name} (${money(p.margin)} profit)`)
        .join(", ")}. Guard their stock and pricing — that is where growth compounds.`,
    );
    parts.push("");
  }

  if (issues.length === 0) {
    parts.push(
      "Nothing urgent is flashing: no heavy low-stock list, open debts, or loss lines in the current snapshot. Focus on consistent POS capture, weekly restock reviews, and protecting margin on your top lines.",
    );
  } else {
    parts.push("**Priorities to improve the business (in order):**");
    parts.push("");
    issues.slice(0, 5).forEach((iss, i) => {
      parts.push(`${i + 1}. **${iss.headline}**`);
      parts.push(`   ${iss.detail}`);
      parts.push(`   → ${iss.action}`);
      parts.push("");
    });
  }

  parts.push(
    "Do these in GetAxe this week rather than guessing: restock what sells, stop what loses money, collect what is owed, and keep cash tills accurate. That is how the numbers turn into growth.",
  );

  return parts.join("\n");
}

function heuristicAnswer(
  question: string,
  ctx: BusinessAdvisorContext,
): string {
  const q = question.toLowerCase().trim();

  // Broad growth / improve / advice questions → full narrative
  if (
    /improv|grow|advice|advis|what should i|how can i|how do i|strateg|focus|priority|priorit|next step|running|health|overview|summary|doing/.test(
      q,
    ) ||
    q.length < 12
  ) {
    return narrativeImprove(ctx);
  }

  const issues = diagnose(ctx);
  const parts: string[] = [];

  if (/profit|margin|making money|losing|loss/.test(q)) {
    const pct = marginPct(ctx.grossProfitMonth, ctx.revenueMonth);
    parts.push(
      `This month gross profit is ${money(ctx.grossProfitMonth)} on ${money(ctx.revenueMonth)} revenue` +
        (pct ? ` (~${pct}% margin)` : "") +
        `. Today’s gross profit is ${money(ctx.grossProfitToday)}.`,
    );
    if (ctx.topProfit.length) {
      parts.push(
        `Top profit products: ${ctx.topProfit
          .slice(0, 5)
          .map((p) => `${p.name} ${money(p.margin)}`)
          .join("; ")}. Lean into these — keep them in stock and priced correctly.`,
      );
    }
    if (ctx.losses.length) {
      parts.push(
        `Loss-makers: ${ctx.losses
          .slice(0, 5)
          .map((p) => `${p.name} ${money(p.margin)}`)
          .join("; ")}. Fix price or stop pushing these until margin is positive.`,
      );
    } else {
      parts.push("No product lines are showing a loss on completed sales this month.");
    }
    return parts.join("\n\n");
  }

  if (/stock|restock|reorder|inventory|expiry|expire|shelf/.test(q)) {
    if (ctx.lowStockCount > 0) {
      parts.push(
        `${ctx.lowStockCount} item(s) are at or below reorder level` +
          (ctx.lowStockNames.length
            ? `: ${ctx.lowStockNames.slice(0, 6).join(", ")}`
            : "") +
          `. That is the fastest way to lose sales.`,
      );
      parts.push(
        "Create a purchase order from the Restock list so you replenish what is actually short — not what feels busy.",
      );
    } else {
      parts.push("No products are currently flagged at or below reorder level.");
    }
    parts.push(`Inventory value at cost: ${money(ctx.stockValue)}.`);
    if (ctx.expiring.length) {
      parts.push(
        `Expiring: ${ctx.expiring.map((e) => `${e.name} (${e.expiryDate})`).join("; ")}. Sell first or write off.`,
      );
    }
    if (ctx.slowStock.length) {
      parts.push(
        `Slow movers: ${ctx.slowStock.map((s) => s.name).join(", ")}. Don’t restock these heavily.`,
      );
    }
    return parts.join("\n\n");
  }

  if (/cash|money|owe|debt|receivable|payable|collect|pay supplier|till|bank/.test(q)) {
    parts.push(
      `Tills and bank total ${money(ctx.cashTotal)}. Customers owe you ${money(ctx.openAr)}; you owe suppliers ${money(ctx.openAp)}.`,
    );
    if (ctx.openAr > 0) {
      parts.push(
        "Priority: collect receivables so cash funds restock instead of sitting on credit invoices.",
      );
    }
    if (ctx.openAp > 0) {
      parts.push(
        "Plan supplier payments so you don’t block inbound stock of fast movers.",
      );
    }
    if (ctx.openAr === 0 && ctx.openAp === 0) {
      parts.push(
        "No open AR/AP in the current snapshot — keep recording payments and credit sales correctly so this stays true.",
      );
    }
    return parts.join("\n\n");
  }

  if (/sell|sales|today|busy|revenue|turnover/.test(q)) {
    parts.push(
      `Today: ${money(ctx.salesToday)} across ${ctx.salesTodayCount} completed sale(s). This month’s revenue is about ${money(ctx.revenueMonth)}.`,
    );
    if (ctx.salesToday === 0) {
      parts.push(
        "If the counter is busy but sales show zero, check that POS tickets are completed. Otherwise push your top-profit products today.",
      );
    }
    if (ctx.topProfit.length) {
      parts.push(
        `Promote: ${ctx.topProfit
          .slice(0, 3)
          .map((p) => p.name)
          .join(", ")}.`,
      );
    }
    return parts.join("\n\n");
  }

  // Fallback: still narrative, not a bullet dump
  return narrativeImprove(ctx);
}

function defaultActions(ctx: BusinessAdvisorContext) {
  const issues = diagnose(ctx);
  const actions: { label: string; href: string }[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((a) => a.href === href)) actions.push({ label, href });
  };

  for (const iss of issues.slice(0, 4)) {
    if (iss.id === "restock") add("Restock / PO", "/dashboard/attention?kind=restock");
    if (iss.id === "loss") add("Loss products", "/dashboard/profit?view=loss");
    if (iss.id === "expiry") add("Expiring stock", "/dashboard/attention?kind=expiry");
    if (iss.id === "ar") add("Collect debts", "/sales/receivables");
    if (iss.id === "ap") add("Pay suppliers", "/purchases/supplier-invoices");
    if (iss.id === "slow") add("Slow stock", "/dashboard/attention?kind=slow");
  }
  add("Gross profit", "/dashboard/profit");
  add("Dashboard", "/dashboard");
  return actions.slice(0, 5);
}

const ADVISOR_SYSTEM = `You are GetAxe Business Advisor for an SME owner in Kenya (KES).
The JSON business facts are LIVE figures from this business's GetAxe database. Treat them as accurate operational numbers.
Write like a sharp business coach, not a report dump: short paragraphs, clear priorities, exact KES figures from the JSON only.
Never invent amounts. End with 2-4 concrete actions inside GetAxe.
If the owner asks how to improve or grow, rank the biggest risks (stock-outs, losses, expiry, slow stock, debts) using the data and tell them what to do first.
Tone: Know, Control, Decide, Grow.`;

type LlmResult = { text: string; provider: "xai" | "groq" };

async function openaiCompatibleChat(opts: {
  url: string;
  apiKey: string;
  model: string;
  question: string;
  ctx: BusinessAdvisorContext;
  label: string;
}): Promise<string | null> {
  const body = {
    model: opts.model,
    temperature: 0.4,
    max_tokens: 900,
    messages: [
      { role: "system", content: ADVISOR_SYSTEM },
      {
        role: "user",
        content: `Business facts (JSON):\n${formatContextForPrompt(opts.ctx)}\n\nOwner question:\n${opts.question}`,
      },
    ],
  };

  try {
    const res = await fetch(opts.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[advisor] ${opts.label}`, res.status, errText.slice(0, 400));
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error(`[advisor] ${opts.label} error`, e);
    return null;
  }
}

/**
 * Prefer xAI Grok (XAI_API_KEY / GROK_API_KEY), then Groq free tier (GROQ_API_KEY).
 */
async function callLlm(
  question: string,
  ctx: BusinessAdvisorContext,
): Promise<LlmResult | null> {
  const xaiKey =
    process.env.XAI_API_KEY?.trim() ||
    process.env.GROK_API_KEY?.trim() ||
    process.env.XAI_KEY?.trim();
  if (xaiKey) {
    const text = await openaiCompatibleChat({
      url: "https://api.x.ai/v1/chat/completions",
      apiKey: xaiKey,
      model:
        process.env.XAI_MODEL?.trim() ||
        process.env.GROK_MODEL?.trim() ||
        "grok-3-mini",
      question,
      ctx,
      label: "xai",
    });
    if (text) return { text, provider: "xai" };
  }

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    const text = await openaiCompatibleChat({
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant",
      question,
      ctx,
      label: "groq",
    });
    if (text) return { text, provider: "groq" };
  }

  return null;
}

export async function askBusinessAdvisor(
  businessId: string,
  question: string,
): Promise<AdvisorReply> {
  const remaining = getAdvisorRemaining(businessId);
  if (remaining <= 0) {
    return {
      answer:
        "You’ve used today’s free advisor messages. Come back tomorrow, or ask your GetAxe partner about a higher message plan when you need more coaching.",
      provider: "none",
      actions: [{ label: "Dashboard", href: "/dashboard" }],
      remainingToday: 0,
    };
  }

  const q = question.trim().slice(0, 800);
  if (!q) {
    return {
      answer:
        "Ask anything about sales, stock, profit, cash, or how to grow — I’ll answer from your live GetAxe numbers.",
      provider: "heuristic",
      actions: [{ label: "Dashboard", href: "/dashboard" }],
      remainingToday: remaining,
    };
  }

  const ctx = await buildBusinessAdvisorContext(businessId);
  const left = consumeUsage(businessId);

  const llm = await callLlm(q, ctx);
  if (llm) {
    return {
      answer: llm.text,
      provider: llm.provider,
      actions: defaultActions(ctx),
      remainingToday: left,
    };
  }

  return {
    answer: heuristicAnswer(q, ctx),
    provider: "heuristic",
    actions: defaultActions(ctx),
    remainingToday: left,
  };
}
