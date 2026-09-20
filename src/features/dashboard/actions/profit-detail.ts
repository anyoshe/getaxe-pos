"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import { nairobiDayBounds } from "@/lib/timezone";
import type { ProfitProductItem } from "../types";

export async function getProfitDetailAction(period: "month" | "today") {
  const user = await requireCurrentUser();
  if (!user.businessId) throw new Error("Business has not been provisioned.");

  const { start: today, end: tomorrow } = nairobiDayBounds();
  const monthStart = new Date(today);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const from = period === "today" ? today : monthStart;
  const to = tomorrow;

  const lines = await db
    .select({
      productId: products.id,
      name: products.name,
      sku: products.sku,
      quantity: sql<string>`coalesce(sum(coalesce(${saleItems.quantityStock}, ${saleItems.quantity})), 0)`,
      revenue: sql<string>`coalesce(sum(${saleItems.total}::numeric), 0)`,
      costPrice: products.costPrice,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(
        eq(saleItems.businessId, user.businessId),
        eq(sales.status, "COMPLETED"),
        gte(sales.soldAt, from),
        lt(sales.soldAt, to),
      ),
    )
    .groupBy(products.id, products.name, products.sku, products.costPrice);

  const rows: ProfitProductItem[] = lines.map((l) => {
    const quantity = Number(l.quantity ?? 0);
    const revenue = Number(l.revenue ?? 0);
    const unitCost = Number(l.costPrice ?? 0);
    const cost = unitCost * quantity;
    const margin = revenue - cost;
    const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
    return {
      productId: l.productId,
      name: l.name,
      sku: l.sku,
      quantity,
      revenue,
      cost,
      margin,
      marginPct,
    };
  });

  const revenue = rows.reduce((a, r) => a + r.revenue, 0);
  const grossProfit = rows.reduce((a, r) => a + r.margin, 0);

  return {
    period,
    revenue,
    grossProfit,
    marginPct: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    all: rows.sort((a, b) => b.margin - a.margin),
    profitable: rows.filter((r) => r.margin > 0).sort((a, b) => b.margin - a.margin),
    losses: rows.filter((r) => r.margin < -0.009).sort((a, b) => a.margin - b.margin),
  };
}
