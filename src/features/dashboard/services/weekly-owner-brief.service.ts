import { and, eq, gte, lt, sql, desc } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import { getLowStockProducts } from "@/features/inventory/queries/low-stock.query";
import { nairobiDayBounds } from "@/lib/timezone";
import { dashboardService } from "./index";

export type WeeklyOwnerBrief = {
  periodLabel: string;
  fromDate: string;
  toDate: string;
  narrative: string;
  snapshot: {
    revenue: number;
    grossProfit: number;
    marginPct: number;
    saleCount: number;
    cashTotal: number;
    openAr: number;
    openAp: number;
    stockValue: number;
    lowStock: number;
    deadStockCount: number;
    deadStockValue: number;
    lossLineCount: number;
  };
  topMargin: Array<{ name: string; margin: number; revenue: number }>;
  deadStock: Array<{ name: string; sku: string | null; quantity: number; stockValue: number }>;
  lossLines: Array<{ name: string; invoiceNumber: string; margin: number }>;
  actions: Array<{ title: string; detail: string; href: string }>;
  generatedAt: string;
};

function money(n: number) {
  return `KES ${Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * In-app weekly owner brief (last 7 Nairobi calendar days inclusive of today).
 * Email/PDF can wrap this later without changing the numbers.
 */
export async function buildWeeklyOwnerBrief(
  businessId: string,
): Promise<WeeklyOwnerBrief> {
  const { start: todayStart } = nairobiDayBounds();
  const to = new Date(todayStart);
  to.setDate(to.getDate() + 1); // exclusive end tomorrow 00:00 Nairobi-ish
  const from = new Date(todayStart);
  from.setDate(from.getDate() - 6);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = todayStart.toISOString().slice(0, 10);

  const [dashboard, saleAgg, itemRows, lowStock] = await Promise.all([
    dashboardService.getOwnerDashboard(businessId),
    db
      .select({
        cnt: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${sales.total}::numeric), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          gte(sales.soldAt, from),
          lt(sales.soldAt, to),
          sql`upper(${sales.status}::text) not in ('VOID','CANCELLED','DRAFT')`,
        ),
      )
      .then((r) => r[0])
      .catch(() => ({ cnt: 0, revenue: 0 })),
    db
      .select({
        productId: saleItems.productId,
        name: products.name,
        revenue: sql<number>`coalesce(sum(${saleItems.total}::numeric), 0)`,
        cost: sql<number>`coalesce(sum(
          (coalesce(${saleItems.quantity}::numeric, 0) *
           coalesce(${products.costPrice}::numeric, 0))
        ), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          gte(sales.soldAt, from),
          lt(sales.soldAt, to),
          sql`upper(${sales.status}::text) not in ('VOID','CANCELLED','DRAFT')`,
        ),
      )
      .groupBy(saleItems.productId, products.name)
      .catch(() => []),
    getLowStockProducts({ businessId }).catch(() => []),
  ]);

  const revenue = Number(saleAgg?.revenue ?? 0);
  const saleCount = Number(saleAgg?.cnt ?? 0);
  let costTotal = 0;
  const byMargin = itemRows.map((r) => {
    const rev = Number(r.revenue ?? 0);
    const cost = Number(r.cost ?? 0);
    costTotal += cost;
    return {
      name: r.name,
      margin: rev - cost,
      revenue: rev,
    };
  });
  byMargin.sort((a, b) => b.margin - a.margin);
  const topMargin = byMargin.filter((x) => x.margin > 0).slice(0, 5);
  const grossProfit = revenue - costTotal;
  const marginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

  const deadStock = (dashboard.slowProducts ?? []).slice(0, 8).map((p) => ({
    name: p.name,
    sku: p.sku,
    quantity: Number(p.quantity ?? 0),
    stockValue: 0,
    daysWithoutSale: Number(p.daysWithoutSale ?? 30),
  }));
  const deadStockValue = 0;

  const lossLines = (dashboard.lossSaleLines ?? [])
    .slice(0, 8)
    .map((l) => ({
      name: l.name,
      invoiceNumber: l.invoiceNumber,
      margin: Number(l.margin ?? 0),
    }));

  const actions: WeeklyOwnerBrief["actions"] = [];
  if (lowStock.length > 0) {
    actions.push({
      title: `Restock ${lowStock.length} line(s)`,
      detail: lowStock
        .slice(0, 3)
        .map((r) => r.productName)
        .join(", "),
      href: "/dashboard/attention?kind=restock",
    });
  }
  if (deadStock.length > 0) {
    actions.push({
      title: "Free cash tied in slow stock",
      detail: `${deadStock.length} item(s) with no sales in 30 days (~${money(deadStockValue)}). Promote or clear.`,
      href: "/dashboard/attention?kind=slow",
    });
  }
  if (lossLines.length > 0) {
    actions.push({
      title: "Stop selling at/below cost",
      detail: "Fix retail prices or category markup before the next shift.",
      href: "/inventory/product-prices",
    });
  }
  if (Number(dashboard.summary.openAr ?? 0) > 0) {
    actions.push({
      title: `Collect ${money(Number(dashboard.summary.openAr))}`,
      detail: "Open receivables",
      href: "/sales/receivables",
    });
  }
  if (actions.length === 0) {
    actions.push({
      title: "Keep the rhythm",
      detail: "No urgent stock or margin flags. Push top-margin lines at POS.",
      href: "/sales/pos",
    });
  }

  const narrative = [
    `Week ${fromStr} → ${toStr}: ${saleCount} sale(s), revenue ${money(revenue)}, gross profit about ${money(grossProfit)} (${marginPct.toFixed(1)}% margin).`,
    `Cash & bank ${money(Number(dashboard.summary.cashTotal ?? 0))} · stock at cost ${money(Number(dashboard.summary.stockValue ?? 0))}.`,
    deadStock.length
      ? `Dead/slow stock: ${deadStock.length} line(s) freezing roughly ${money(deadStockValue)}.`
      : "No slow-moving stock flagged this week.",
    lossLines.length
      ? `${lossLines.length} recent line(s) sold at or below cost — review pricing policy.`
      : "No at-cost sales flagged in the recent loss scan.",
  ].join(" ");

  return {
    periodLabel: `Last 7 days (${fromStr} – ${toStr})`,
    fromDate: fromStr,
    toDate: toStr,
    narrative,
    snapshot: {
      revenue,
      grossProfit,
      marginPct,
      saleCount,
      cashTotal: Number(dashboard.summary.cashTotal ?? 0),
      openAr: Number(dashboard.summary.openAr ?? 0),
      openAp: Number(dashboard.summary.openAp ?? 0),
      stockValue: Number(dashboard.summary.stockValue ?? 0),
      lowStock: lowStock.length,
      deadStockCount: deadStock.length,
      deadStockValue,
      lossLineCount: lossLines.length,
    },
    topMargin,
    deadStock,
    lossLines,
    actions: actions.slice(0, 4),
    generatedAt: new Date().toISOString(),
  };
}
