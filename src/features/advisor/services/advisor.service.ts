import {
  buildBusinessAdvisorContext,
  formatContextForPrompt,
  type BusinessAdvisorContext,
} from "./business-context.service";

export type AdvisorReply = {
  answer: string;
  provider: "groq" | "heuristic" | "none";
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

function heuristicAnswer(
  question: string,
  ctx: BusinessAdvisorContext,
): string {
  const q = question.toLowerCase();
  const lines: string[] = [];

  lines.push(
    `Figures below are live from your GetAxe records as of ${new Date(ctx.asOf).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}:`,
  );

  if (
    /profit|margin|making money|losing/.test(q) ||
    q.includes("how is") ||
    q.includes("performance")
  ) {
    lines.push(
      `• Gross profit this month: ${money(ctx.grossProfitMonth)} on ${money(ctx.revenueMonth)} revenue.`,
    );
    lines.push(`• Gross profit today: ${money(ctx.grossProfitToday)}.`);
    if (ctx.topProfit.length) {
      lines.push(
        `• Strongest margins: ${ctx.topProfit
          .slice(0, 3)
          .map((p) => `${p.name} (${money(p.margin)})`)
          .join("; ")}.`,
      );
    }
    if (ctx.losses.length) {
      lines.push(
        `• Sold at a loss: ${ctx.losses
          .slice(0, 3)
          .map((p) => `${p.name} (${money(p.margin)})`)
          .join("; ")}. Review selling price vs cost.`,
      );
    }
  }

  if (/stock|restock|reorder|inventory|expiry|expire/.test(q)) {
    lines.push(
      `• ${ctx.lowStockCount} product(s) at or below reorder level${
        ctx.lowStockNames.length
          ? `: ${ctx.lowStockNames.slice(0, 5).join(", ")}`
          : ""
      }.`,
    );
    if (ctx.expiring.length) {
      lines.push(
        `• Expiring soon: ${ctx.expiring
          .map((e) => `${e.name} (${e.expiryDate})`)
          .join("; ")}. Prioritise sales or write-off.`,
      );
    }
    if (ctx.slowStock.length) {
      lines.push(
        `• Slow stock (no sales ~30 days): ${ctx.slowStock
          .map((s) => s.name)
          .join(", ")}. Avoid over-ordering these.`,
      );
    }
    lines.push(`• Stock capital tied up: ${money(ctx.stockValue)}.`);
  }

  if (/cash|money|owe|debt|receivable|payable|collect|pay supplier/.test(q)) {
    lines.push(`• Cash & bank (tills): ${money(ctx.cashTotal)}.`);
    lines.push(`• Open receivables (customers owe you): ${money(ctx.openAr)}.`);
    lines.push(`• Open payables (you owe suppliers): ${money(ctx.openAp)}.`);
    if (ctx.openAr > 0) {
      lines.push(`• Action: collect outstanding credit invoices.`);
    }
    if (ctx.openAp > 0) {
      lines.push(`• Action: plan supplier payments so stock flow continues.`);
    }
  }

  if (/sell|sales|today|busy/.test(q)) {
    lines.push(
      `• Today’s completed sales: ${money(ctx.salesToday)} (${ctx.salesTodayCount} sale(s)).`,
    );
  }

  if (lines.length <= 1) {
    lines.push(`• Today’s sales: ${money(ctx.salesToday)}.`);
    lines.push(`• Month gross profit: ${money(ctx.grossProfitMonth)}.`);
    lines.push(`• Cash & bank: ${money(ctx.cashTotal)}.`);
    lines.push(`• Low stock items: ${ctx.lowStockCount}.`);
    lines.push(`• Open AR ${money(ctx.openAr)} · Open AP ${money(ctx.openAp)}.`);
    if (ctx.attentionTitles.length) {
      lines.push(`• Needs attention: ${ctx.attentionTitles.join(" · ")}.`);
    }
  }

  lines.push("");
  lines.push("Suggested next steps:");
  if (ctx.lowStockCount > 0) {
    lines.push("1. Open Restock / create a purchase order for low-stock lines.");
  }
  if (ctx.losses.length > 0) {
    lines.push("2. Review loss-making products (price list or stop discounting below cost).");
  }
  if (ctx.openAr > 0) {
    lines.push("3. Follow up receivables in Sales → Receivables.");
  }
  if (ctx.expiring.length > 0) {
    lines.push("4. Push expiring batches at POS (FEFO) or write off dead stock.");
  }
  if (
    ctx.lowStockCount === 0 &&
    ctx.losses.length === 0 &&
    ctx.openAr === 0
  ) {
    lines.push(
      "1. Keep monitoring dashboard “Needs your attention”.",
      "2. Review top profit lines and protect their stock levels.",
    );
  }

  lines.push("");
  lines.push(
    "All amounts above come from completed sales, product costs, stock, and open balances in GetAxe. For other date ranges use Reports.",
  );

  return lines.join("\n");
}

function defaultActions(ctx: BusinessAdvisorContext) {
  const actions: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Gross profit", href: "/dashboard/profit" },
  ];
  if (ctx.lowStockCount > 0) {
    actions.push({
      label: "Restock list",
      href: "/dashboard/attention?kind=restock",
    });
  }
  if (ctx.openAr > 0) {
    actions.push({ label: "Collect debts", href: "/sales/receivables" });
  }
  if (ctx.openAp > 0) {
    actions.push({
      label: "Supplier invoices",
      href: "/purchases/supplier-invoices",
    });
  }
  actions.push({ label: "Reports", href: "/reports" });
  return actions.slice(0, 5);
}

async function callGroq(
  question: string,
  ctx: BusinessAdvisorContext,
): Promise<string | null> {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) return null;

  const system = `You are GetAxe Business Advisor for an SME owner in Kenya (KES).
The JSON business facts are LIVE figures from this business's GetAxe database (sales, costs, stock, cash, AR/AP). Treat them as accurate operational numbers from the system.
Use ONLY those facts. Never invent or estimate amounts not present in the JSON.
State exact KES figures from the data. Be concise and practical. End with 2-4 concrete actions in GetAxe (restock, collect debts, review prices, sell expiring stock first, etc.).
If the JSON cannot answer the question, say which figure is missing and which screen to open (Reports, Stock, Receivables, etc.).
Do not say "this is not an audit" or disclaim accuracy of the provided JSON — the numbers are system truth. You may note that external factors (tax filings, bank statements not yet entered) are outside GetAxe.
Tone: owner language — Know, Control, Decide, Grow.`;

  const body = {
    model: process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant",
    temperature: 0.3,
    max_tokens: 700,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Business facts (JSON):\n${formatContextForPrompt(ctx)}\n\nOwner question:\n${question}`,
      },
    ],
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[advisor] groq", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error("[advisor] groq error", e);
    return null;
  }
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
      answer: "Ask a question about sales, stock, profit, cash, or what to do next.",
      provider: "heuristic",
      actions: [{ label: "Dashboard", href: "/dashboard" }],
      remainingToday: remaining,
    };
  }

  const ctx = await buildBusinessAdvisorContext(businessId);
  const left = consumeUsage(businessId);

  const groq = await callGroq(q, ctx);
  if (groq) {
    return {
      answer: groq,
      provider: "groq",
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
