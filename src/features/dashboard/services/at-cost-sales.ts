import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import type { LossSaleLine, ProfitProductItem } from "../types";

/**
 * Line-level detection: completed sale lines where line total ≤ stock qty × book cost.
 * Aggregating by product first hides items that had both profit and at-cost lines.
 */
export async function findAtCostOrLossLines(
  businessId: string,
  from: Date,
  to: Date,
  limit = 150,
): Promise<LossSaleLine[]> {
  const rows = await db
    .select({
      saleItemId: saleItems.id,
      saleId: sales.id,
      invoiceNumber: sales.invoiceNumber,
      soldAt: sales.soldAt,
      productId: products.id,
      name: products.name,
      sku: products.sku,
      quantity: sql<string>`coalesce(${saleItems.quantityStock}, ${saleItems.quantity})`,
      unitPrice: saleItems.unitPrice,
      revenue: saleItems.total,
      unitCost: products.costPrice,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(
        eq(saleItems.businessId, businessId),
        eq(sales.status, "COMPLETED"),
        gte(sales.soldAt, from),
        lt(sales.soldAt, to),
        sql`coalesce(${products.costPrice}::numeric, 0) > 0`,
        sql`coalesce(${saleItems.total}::numeric, 0)
          <= coalesce(${saleItems.quantityStock}, ${saleItems.quantity})::numeric
            * coalesce(${products.costPrice}::numeric, 0) + 0.05`,
      ),
    )
    .orderBy(desc(sales.soldAt))
    .limit(limit)
    .catch(() => []);

  return (
    rows as {
      saleItemId: string;
      saleId: string;
      invoiceNumber: string;
      soldAt: Date;
      productId: string;
      name: string;
      sku: string | null;
      quantity: string;
      unitPrice: string;
      revenue: string;
      unitCost: string | number | null;
    }[]
  ).map((r) => {
    const quantity = Number(r.quantity ?? 0);
    const revenue = Number(r.revenue ?? 0);
    const unitCost = Number(r.unitCost ?? 0);
    const cost = unitCost * quantity;
    return {
      saleItemId: r.saleItemId,
      saleId: r.saleId,
      invoiceNumber: r.invoiceNumber,
      soldAt:
        r.soldAt instanceof Date ? r.soldAt.toISOString() : String(r.soldAt),
      productId: r.productId,
      name: r.name,
      sku: r.sku,
      quantity,
      unitPrice: Number(r.unitPrice ?? 0),
      revenue,
      unitCost,
      cost,
      margin: revenue - cost,
    };
  });
}

/** Roll line-level at-cost sales up to product cards for the dashboard. */
export function aggregateAtCostProducts(
  lines: LossSaleLine[],
): ProfitProductItem[] {
  const byProduct = new Map<
    string,
    {
      productId: string;
      name: string;
      sku: string | null;
      quantity: number;
      revenue: number;
      cost: number;
      margin: number;
      invoices: Set<string>;
      lineCount: number;
    }
  >();

  for (const line of lines) {
    const cur = byProduct.get(line.productId) ?? {
      productId: line.productId,
      name: line.name,
      sku: line.sku,
      quantity: 0,
      revenue: 0,
      cost: 0,
      margin: 0,
      invoices: new Set<string>(),
      lineCount: 0,
    };
    cur.quantity += line.quantity;
    cur.revenue += line.revenue;
    cur.cost += line.cost;
    cur.margin += line.margin;
    cur.invoices.add(line.invoiceNumber);
    cur.lineCount += 1;
    byProduct.set(line.productId, cur);
  }

  return [...byProduct.values()]
    .map((r) => ({
      productId: r.productId,
      name: r.name,
      sku: r.sku,
      quantity: r.quantity,
      revenue: r.revenue,
      cost: r.cost,
      margin: r.margin,
      marginPct: r.revenue > 0 ? (r.margin / r.revenue) * 100 : 0,
      atCostInvoices: [...r.invoices].slice(0, 10),
      atCostLineCount: r.lineCount,
    }))
    .sort((a, b) => a.margin - b.margin);
}
