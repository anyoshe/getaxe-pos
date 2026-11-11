/**
 * Phase B — owner daily / weekly brief from live advisor context.
 * Deterministic narrative (no invented numbers). WhatsApp can reuse the same text later.
 */

import type { BusinessAdvisorContext } from "./business-context.service";

export type OwnerBriefPeriod = "daily" | "weekly";

function money(n: number) {
  return `KES ${Math.round(n).toLocaleString("en-KE")}`;
}

function marginPct(profit: number, revenue: number): string | null {
  if (revenue <= 0) return null;
  return ((profit / revenue) * 100).toFixed(1);
}

export function parseOwnerBriefIntent(
  question: string,
): OwnerBriefPeriod | null {
  const q = question.toLowerCase().trim();
  if (
    /weekly\s*brief|week\s*in\s*review|this\s*week|weekly\s*summary|week\s*summary/.test(
      q,
    )
  ) {
    return "weekly";
  }
  if (
    /daily\s*brief|today'?s\s*brief|owner\s*brief|morning\s*brief|end\s*of\s*day|how\s*is\s*(my\s*)?business|business\s*doing|give\s*me\s*(a\s*)?brief|status\s*report|pulse/.test(
      q,
    )
  ) {
    return "daily";
  }
  if (/^brief$|^summary$|^overview$/.test(q)) return "daily";
  return null;
}

export function buildOwnerBrief(
  ctx: BusinessAdvisorContext,
  period: OwnerBriefPeriod,
): string {
  const name = ctx.businessName?.trim() || "Your shop";
  const asOf = new Date(ctx.asOf);
  const when = asOf.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [];

  if (period === "daily") {
    lines.push(`**Daily owner brief — ${name}**`);
    lines.push(`_As of ${when} (Nairobi)_`);
    lines.push("");
    lines.push(
      `**1. Sales today:** ${money(ctx.salesToday)}` +
        (ctx.salesTodayCount
          ? ` · ${ctx.salesTodayCount} sale(s)`
          : " · no completed sales yet"),
    );
    lines.push(
      `**2. Gross profit today:** ${money(ctx.grossProfitToday)}` +
        (ctx.salesToday > 0
          ? ` (${marginPct(ctx.grossProfitToday, ctx.salesToday) ?? "—"}% on today’s sales)`
          : ""),
    );
  } else {
    lines.push(`**Weekly-style owner brief — ${name}**`);
    lines.push(`_As of ${when} (Nairobi) · month-to-date figures_`);
    lines.push("");
    lines.push(
      `**1. Month sales (proxy for the week view):** ${money(ctx.revenueMonth)}`,
    );
    lines.push(
      `**2. Month gross profit:** ${money(ctx.grossProfitMonth)}` +
        (marginPct(ctx.grossProfitMonth, ctx.revenueMonth)
          ? ` (~${marginPct(ctx.grossProfitMonth, ctx.revenueMonth)}% margin)`
          : ""),
    );
    lines.push(
      `**Today so far:** ${money(ctx.salesToday)} sales · ${money(ctx.grossProfitToday)} gross profit`,
    );
  }

  lines.push(
    `**3. Cash position:** ${money(ctx.cashTotal)} in tills/banks (system total)`,
  );
  lines.push(
    `**4. Money tied up:** stock ~${money(ctx.stockValue)} · customers owe ${money(ctx.openAr)} · you owe suppliers ${money(ctx.openAp)}`,
  );

  // Priority risks
  const risks: string[] = [];
  if (ctx.lowStockCount > 0) {
    risks.push(
      `${ctx.lowStockCount} low-stock item(s)` +
        (ctx.lowStockNames.length
          ? ` (${ctx.lowStockNames.slice(0, 3).join(", ")}${ctx.lowStockNames.length > 3 ? "…" : ""})`
          : ""),
    );
  }
  if (ctx.losses.length > 0) {
    risks.push(
      `loss-makers: ${ctx.losses
        .slice(0, 2)
        .map((p) => p.name)
        .join(", ")}`,
    );
  }
  if (ctx.expiring.length > 0) {
    risks.push(
      `expiring: ${ctx.expiring
        .slice(0, 2)
        .map((e) => e.name)
        .join(", ")}`,
    );
  }
  if (ctx.openAr > 0 && ctx.openAr >= ctx.salesToday && ctx.salesToday > 0) {
    risks.push("receivables high vs today’s sales — chase collections");
  }
  if (ctx.attentionTitles.length) {
    risks.push(ctx.attentionTitles[0]);
  }

  lines.push("");
  if (risks.length) {
    lines.push(`**5. Watch closely:** ${risks.slice(0, 4).join("; ")}.`);
  } else {
    lines.push(
      "**5. Watch closely:** no major stock/loss/expiry flags in the live snapshot.",
    );
  }

  if (ctx.topProfit.length > 0) {
    lines.push(
      `**6. Protect these margins:** ${ctx.topProfit
        .slice(0, 3)
        .map((p) => `${p.name} (${money(p.margin)})`)
        .join("; ")}.`,
    );
  }

  if (!ctx.setup.isSetupComplete && ctx.setup.next) {
    lines.push("");
    lines.push(
      `**Setup still open:** next is **${ctx.setup.next.label}** — finish go-live so numbers stay trustworthy.`,
    );
  }

  lines.push("");
  lines.push("**Do next (pick one):**");
  if (!ctx.setup.isSetupComplete && ctx.setup.next) {
    lines.push(`- Finish setup: ${ctx.setup.next.label}`);
  }
  if (ctx.lowStockCount > 0) {
    lines.push("- Restock / draft a purchase order for low stock");
  }
  if (ctx.openAr > 0) {
    lines.push("- Collect what customers owe (receivables)");
  }
  if (ctx.losses.length > 0) {
    lines.push("- Review loss products and fix price or stop promoting them");
  }
  lines.push("- Open POS if you still need today’s first (or next) sale");

  lines.push("");
  lines.push("_Tip: ask for “WhatsApp brief” or use **Copy for WhatsApp** to share._");

  return lines.join("\n");
}

export function ownerBriefActions(ctx: BusinessAdvisorContext): {
  label: string;
  href?: string;
  copyWhatsApp?: boolean;
}[] {
  const actions: {
    label: string;
    href?: string;
    copyWhatsApp?: boolean;
  }[] = [];
  const add = (label: string, href: string) => {
    if (!actions.some((a) => a.href === href)) actions.push({ label, href });
  };

  actions.push({ label: "Copy for WhatsApp", copyWhatsApp: true });

  if (!ctx.setup.isSetupComplete) {
    add("Go live in 1 day", "/settings/go-live");
    if (ctx.setup.next) add(ctx.setup.next.label, ctx.setup.next.href);
  }
  if (ctx.lowStockCount > 0) {
    add("Restock / attention", "/dashboard/attention?kind=restock");
  }
  if (ctx.openAr > 0) add("Receivables", "/sales/receivables");
  if (ctx.losses.length > 0) {
    add("Loss products", "/dashboard/profit?view=loss");
  }
  add("Dashboard", "/dashboard");
  add("Open POS", "/sales/pos");
  return actions.slice(0, 7);
}

/** Phase G — plain text suitable for WhatsApp (no markdown). */
export function toWhatsAppPlainText(markdownish: string): string {
  return markdownish
    .replace(/\*\*([^*]+)\*\*/g, "*$1*") // WhatsApp bold uses single *
    .replace(/^_+/gm, "")
    .replace(/_+$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildOwnerBriefWhatsApp(
  ctx: BusinessAdvisorContext,
  period: OwnerBriefPeriod,
): string {
  const body = buildOwnerBrief(ctx, period)
    // drop the "WhatsApp later" footer from Phase B
    .replace(/\n*_?WhatsApp delivery[\s\S]*$/i, "")
    .trim();
  const header =
    period === "weekly"
      ? "GetAxe weekly brief"
      : "GetAxe daily brief";
  return toWhatsAppPlainText(`${header}\n\n${body}\n\n— via GetAxe`);
}

export function parseWhatsAppBriefIntent(
  question: string,
): OwnerBriefPeriod | null {
  const q = question.toLowerCase().trim();
  if (
    !/whats?app|share\s+brief|copy\s+brief|send\s+(me\s+)?(the\s+)?brief|brief\s+for\s+(wa|whats?app)/.test(
      q,
    )
  ) {
    return null;
  }
  if (/week/.test(q)) return "weekly";
  return "daily";
}
