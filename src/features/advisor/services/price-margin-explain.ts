/**
 * Phase F — price & margin explanations from live GetAxe numbers only.
 */

import { and, eq, ilike, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import type { BusinessAdvisorContext } from "./business-context.service";

function money(n: number) {
  return `KES ${Math.round(n).toLocaleString("en-KE")}`;
}

function pct(part: number, whole: number): string | null {
  if (whole <= 0) return null;
  return ((part / whole) * 100).toFixed(1);
}

export function parsePriceMarginIntent(question: string): boolean {
  const q = question.toLowerCase().trim();
  if (
    /\b(margin|markup|gross\s*profit|loss[\s-]*maker|below\s*cost|under\s*cost|cost\s*price|selling\s*price|priced?\s*(too\s*)?(low|high)|why\s*(is|are).{0,20}(profit|margin|loss)|explain.{0,15}(price|margin|profit)|which.{0,20}(profit|loss)|top\s*profit|profitable)\b/.test(
      q,
    )
  ) {
    return true;
  }
  if (/^(prices?|margins?|profit)\??$/.test(q)) return true;
  return false;
}

/** Pull a possible product name after "for" / "on" / quotes. */
function extractProductHint(question: string): string | null {
  const q = question.trim();
  const m =
    /(?:for|on|about|of)\s+["']?([^?"']{2,80})["']?\??$/i.exec(q) ||
    /["']([^"']{2,80})["']/.exec(q);
  if (m?.[1]) {
    const hint = m[1].trim();
    if (
      /^(margin|profit|price|loss|cost|the|my|this|that|month|today)$/i.test(
        hint,
      )
    ) {
      return null;
    }
    return hint;
  }
  return null;
}

async function findProductsByHint(
  businessId: string,
  hint: string,
): Promise<
  {
    name: string;
    costPrice: number | null;
    sku: string | null;
  }[]
> {
  const rows = await db
    .select({
      name: products.name,
      costPrice: products.costPrice,
      sku: products.sku,
    })
    .from(products)
    .where(
      and(
        eq(products.businessId, businessId),
        eq(products.active, true),
        ilike(products.name, `%${hint.replace(/[%_]/g, "")}%`),
      ),
    )
    .limit(5)
    .catch(() => []);

  return rows.map((r) => ({
    name: r.name,
    costPrice:
      r.costPrice != null && r.costPrice !== ""
        ? Number(r.costPrice)
        : null,
    sku: r.sku,
  }));
}

export async function buildPriceMarginExplanation(
  businessId: string,
  question: string,
  ctx: BusinessAdvisorContext,
): Promise<string> {
  const q = question.toLowerCase();
  const lines: string[] = [];
  const monthPct = pct(ctx.grossProfitMonth, ctx.revenueMonth);
  const todayPct = pct(ctx.grossProfitToday, ctx.salesToday);

  lines.push("**Price & margin (live GetAxe data)**");
  lines.push("");

  // Overall picture
  lines.push(
    `**Shop margin this month:** ${money(ctx.grossProfitMonth)} gross profit on ${money(ctx.revenueMonth)} sales` +
      (monthPct ? ` → **~${monthPct}%**` : " (no sales yet this month)") +
      ".",
  );
  lines.push(
    `**Today:** ${money(ctx.grossProfitToday)} gross profit on ${money(ctx.salesToday)} sales` +
      (todayPct ? ` (~${todayPct}%)` : "") +
      ".",
  );
  lines.push("");

  // Product-specific if named
  const hint = extractProductHint(question);
  if (hint) {
    const found = await findProductsByHint(businessId, hint);
    if (found.length) {
      lines.push(`**Products matching “${hint}”:**`);
      for (const p of found) {
        const fromProfit = ctx.topProfit.find((t) =>
          t.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 12)),
        );
        const fromLoss = ctx.losses.find((t) =>
          t.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 12)),
        );
        let extra = "";
        if (fromProfit) {
          extra = ` · month contribution ~${money(fromProfit.margin)} profit`;
        } else if (fromLoss) {
          extra = ` · month contribution ~${money(fromLoss.margin)} (loss)`;
        }
        lines.push(
          `- **${p.name}**` +
            (p.sku ? ` (${p.sku})` : "") +
            (p.costPrice != null && p.costPrice > 0
              ? ` · cost on file ${money(p.costPrice)}`
              : " · cost not set") +
            extra,
        );
      }
      lines.push(
        "_Selling price lives on price lists / product prices; margin on sales uses average cost when stock moves._",
      );
      lines.push("");
    } else {
      lines.push(
        `No active product name matched “${hint}”. Check **Products** or try a shorter name.`,
      );
      lines.push("");
    }
  }

  // Top / loss lists
  if (ctx.topProfit.length > 0) {
    lines.push("**Top profit contributors (month):**");
    for (const p of ctx.topProfit.slice(0, 6)) {
      lines.push(`- ${p.name} — ${money(p.margin)}`);
    }
    lines.push(
      "Keep these in stock and avoid unnecessary discounts on them.",
    );
    lines.push("");
  }

  if (ctx.losses.length > 0) {
    lines.push("**Loss-makers (month):**");
    for (const p of ctx.losses.slice(0, 6)) {
      lines.push(`- ${p.name} — ${money(p.margin)}`);
    }
    lines.push(
      "Raise sell price, cut cost (better supplier), or stop promoting until margin is positive. POS can block below-cost sales depending on your policy.",
    );
    lines.push("");
  } else if (/loss|losing|below\s*cost/.test(q)) {
    lines.push(
      "No product lines are showing a **loss** on completed sales in the current month snapshot.",
    );
    lines.push("");
  }

  // How pricing works in GetAxe
  if (/how|explain|what is|markup|set\s*price|pricing/.test(q)) {
    lines.push("**How pricing works here:**");
    lines.push(
      "1. **Cost** on the product (and purchases) feeds stock valuation and margin.",
    );
    lines.push(
      "2. **Selling price** comes from product prices / default price list (POS retail or wholesale).",
    );
    lines.push(
      "3. **Gross profit** on a sale ≈ sell − cost of the units sold (not pure “markup %” on the shelf tag alone).",
    );
    lines.push(
      "4. Fix prices under **Product prices** or **Price lists**; optional category markup can bulk-update.",
    );
    lines.push("");
  }

  lines.push("**Do next:**");
  if (ctx.losses.length > 0) {
    lines.push("- Open loss products and correct sell price or cost");
  }
  lines.push("- Review product prices / price lists for your top sellers");
  if (ctx.lowStockCount > 0) {
    lines.push("- Restock top profit lines that are low so you don’t lose margin sales");
  }

  return lines.join("\n");
}

export function priceMarginActions(ctx: BusinessAdvisorContext): {
  label: string;
  href: string;
}[] {
  const actions: { label: string; href: string }[] = [
    { label: "Gross profit", href: "/dashboard/profit" },
    { label: "Product prices", href: "/inventory/product-prices" },
    { label: "Price lists", href: "/inventory/price-lists" },
  ];
  if (ctx.losses.length > 0) {
    actions.unshift({
      label: "Loss products",
      href: "/dashboard/profit?view=loss",
    });
  }
  return actions.slice(0, 6);
}
