import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { stockMovements } from "@/db/schema/inventory/stock_movements";
import { warehouses } from "@/db/schema/settings/warehouses";
import { saleItems } from "@/db/schema/sales/sale_items";
import { sales } from "@/db/schema/sales/sales";
import { payments } from "@/db/schema/sales/payments";
import { nairobiDateRangeBounds } from "@/lib/timezone";



type PeriodBucket = {
  key: string;
  label: string;
  start: Date;
  end: Date; // exclusive
  granularity: "day" | "week" | "month";
};

function parseYmd(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function daysBetween(fromDate: string, toDate: string) {
  const a = parseYmd(fromDate);
  const b = parseYmd(toDate);
  const t0 = Date.UTC(a.y, a.m - 1, a.d);
  const t1 = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((t1 - t0) / 86400000) + 1;
}

function buildPeriodBuckets(fromDate: string, toDate: string): PeriodBucket[] {
  const span = daysBetween(fromDate, toDate);
  const granularity: "day" | "week" | "month" =
    span <= 14 ? "day" : span <= 90 ? "week" : "month";
  const buckets: PeriodBucket[] = [];
  const a = parseYmd(fromDate);
  const b = parseYmd(toDate);
  let y = a.y;
  let m = a.m;
  let d = a.d;

  const endLimit = Date.UTC(b.y, b.m - 1, b.d + 1);

  if (granularity === "day") {
    while (Date.UTC(y, m - 1, d) < endLimit) {
      const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      const end = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0, 0));
      const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      buckets.push({
        key,
        label: key.slice(5), // MM-DD
        start,
        end,
        granularity,
      });
      d += 1;
      const n = new Date(Date.UTC(y, m - 1, d));
      y = n.getUTCFullYear();
      m = n.getUTCMonth() + 1;
      d = n.getUTCDate();
    }
  } else if (granularity === "week") {
    let cursor = new Date(Date.UTC(a.y, a.m - 1, a.d, 0, 0, 0, 0));
    let week = 1;
    while (cursor.getTime() < endLimit) {
      const start = new Date(cursor);
      const end = new Date(cursor.getTime() + 7 * 86400000);
      const endClamped = end.getTime() > endLimit ? new Date(endLimit) : end;
      const key = `W${week}`;
      buckets.push({
        key,
        label: `W${week}`,
        start,
        end: endClamped,
        granularity,
      });
      cursor = end;
      week += 1;
      if (week > 30) break;
    }
  } else {
    let cy = a.y;
    let cm = a.m;
    while (Date.UTC(cy, cm - 1, 1) < endLimit) {
      const start =
        cy === a.y && cm === a.m
          ? new Date(Date.UTC(a.y, a.m - 1, a.d, 0, 0, 0, 0))
          : new Date(Date.UTC(cy, cm - 1, 1, 0, 0, 0, 0));
      const nextM = cm === 12 ? 1 : cm + 1;
      const nextY = cm === 12 ? cy + 1 : cy;
      let end = new Date(Date.UTC(nextY, nextM - 1, 1, 0, 0, 0, 0));
      if (end.getTime() > endLimit) end = new Date(endLimit);
      const key = `${cy}-${String(cm).padStart(2, "0")}`;
      buckets.push({
        key,
        label: key,
        start,
        end,
        granularity,
      });
      cy = nextY;
      cm = nextM;
      if (buckets.length > 24) break;
    }
  }
  return buckets;
}

function bucketKeyForDate(
  createdAt: Date | string,
  buckets: PeriodBucket[],
): string | null {
  const t =
    createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  for (const b of buckets) {
    if (t >= b.start.getTime() && t < b.end.getTime()) return b.key;
  }
  return null;
}


export class OperationalReportsService {
  /**
   * Sales performance by product for a date range (inclusive days in Nairobi).
   * Margin uses product cost_price × quantity when available.
   */
  async salesPerformance(
    businessId: string,
    fromDate: string,
    toDate: string,
  ) {
    const { start, end } = nairobiDateRangeBounds(fromDate, toDate);

    const lines = await db
      .select({
        productId: saleItems.productId,
        productName: products.name,
        sku: products.sku,
        quantity: sql<string>`coalesce(sum(${saleItems.quantity}::numeric), 0)`,
        revenue: sql<string>`coalesce(sum(${saleItems.total}::numeric), 0)`,
        tax: sql<string>`coalesce(sum(${saleItems.tax}::numeric), 0)`,
        discount: sql<string>`coalesce(sum(${saleItems.discount}::numeric), 0)`,
        costPrice: products.costPrice,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
        ),
      )
      .groupBy(
        saleItems.productId,
        products.name,
        products.sku,
        products.costPrice,
      )
      .orderBy(sql`sum(${saleItems.total}::numeric) desc`);

    const rows = lines.map((l) => {
      const qty = Number(l.quantity ?? 0);
      const revenue = Number(l.revenue ?? 0);
      const tax = Number(l.tax ?? 0);
      const discount = Number(l.discount ?? 0);
      const unitCost = Number(l.costPrice ?? 0);
      const cost = unitCost * qty;
      const margin = revenue - cost;
      const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
      return {
        productId: l.productId,
        productName: l.productName,
        sku: l.sku,
        quantity: qty,
        revenue,
        tax,
        discount,
        cost,
        margin,
        marginPct,
      };
    });

    const totals = rows.reduce(
      (a, r) => ({
        quantity: a.quantity + r.quantity,
        revenue: a.revenue + r.revenue,
        tax: a.tax + r.tax,
        discount: a.discount + r.discount,
        cost: a.cost + r.cost,
        margin: a.margin + r.margin,
      }),
      { quantity: 0, revenue: 0, tax: 0, discount: 0, cost: 0, margin: 0 },
    );

    const [saleAgg] = await db
      .select({
        invoiceCount: sql<number>`count(*)::int`,
        invoiceTotal: sql<string>`coalesce(sum(${sales.total}), 0)`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
        ),
      );

    const payByMethod = await db
      .select({
        method: payments.method,
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.businessId, businessId),
          eq(payments.status, "COMPLETED"),
          gte(payments.paidAt, start),
          lt(payments.paidAt, end),
        ),
      )
      .groupBy(payments.method);

    return {
      fromDate,
      toDate,
      invoiceCount: Number(saleAgg?.invoiceCount ?? 0),
      invoiceTotal: Number(saleAgg?.invoiceTotal ?? 0),
      totals: {
        ...totals,
        marginPct:
          totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0,
      },
      byProduct: rows,
      paymentsByMethod: payByMethod.map((p) => ({
        method: String(p.method),
        total: Number(p.total ?? 0),
        count: Number(p.count ?? 0),
      })),
    };
  }

  async stockMovementsReport(
    businessId: string,
    fromDate: string,
    toDate: string,
  ) {
    const { start, end } = nairobiDateRangeBounds(fromDate, toDate);

    // Opening stock at start = sum of all movements before the period
    const openings = await db
      .select({
        productId: stockMovements.productId,
        opening: sql<string>`coalesce(sum(${stockMovements.quantity}::numeric), 0)`,
      })
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.businessId, businessId),
          lt(stockMovements.createdAt, start),
        ),
      )
      .groupBy(stockMovements.productId);

    const openingByProduct = new Map(
      openings.map((o) => [o.productId, Number(o.opening ?? 0)]),
    );

    // Movements in period, oldest first for running balance
    const rows = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        createdAt: stockMovements.createdAt,
        movementType: stockMovements.movementType,
        quantity: stockMovements.quantity,
        reference: stockMovements.reference,
        notes: stockMovements.notes,
        productName: products.name,
        sku: products.sku,
        warehouseName: warehouses.name,
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .innerJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
      .where(
        and(
          eq(stockMovements.businessId, businessId),
          gte(stockMovements.createdAt, start),
          lt(stockMovements.createdAt, end),
        ),
      )
      .orderBy(asc(stockMovements.createdAt), asc(stockMovements.id))
      .limit(8000);

    // Running balance per product
    const running = new Map<string, number>();
    const detailRows = rows.map((r) => {
      const pid = r.productId;
      if (!running.has(pid)) {
        running.set(pid, openingByProduct.get(pid) ?? 0);
      }
      const before = running.get(pid)!;
      const qty = Number(r.quantity ?? 0);
      const after = before + qty;
      running.set(pid, after);
      return {
        id: r.id,
        productId: pid,
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleString("en-KE", {
              timeZone: "UTC",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "—",
        movementType: String(r.movementType),
        quantity: qty,
        balanceBefore: before,
        balanceAfter: after,
        reference: r.reference,
        notes: r.notes,
        productName: r.productName,
        sku: r.sku,
        warehouseName: r.warehouseName,
      };
    });

    // Products that moved in period + any with opening only if they moved
    const productIds = [...new Set(detailRows.map((r) => r.productId))];
    const byProduct = productIds
      .map((pid) => {
        const movements = detailRows.filter((r) => r.productId === pid);
        const first = movements[0];
        const opening = openingByProduct.get(pid) ?? 0;
        const closing =
          movements.length > 0
            ? movements[movements.length - 1]!.balanceAfter
            : opening;
        let qtyIn = 0;
        let qtyOut = 0;
        for (const m of movements) {
          const q = Number(m.quantity);
          if (!Number.isFinite(q) || q === 0) continue;
          if (q > 0) qtyIn += q;
          else qtyOut += Math.abs(q);
        }
        const net = qtyIn - qtyOut;
        return {
          productId: pid,
          productName: first?.productName ?? "—",
          sku: first?.sku ?? null,
          openingStock: opening,
          quantityIn: qtyIn,
          quantityOut: qtyOut,
          quantityNet: net,
          /** @deprecated use quantityIn/Out/Net — kept for older clients */
          quantityMoved: net,
          closingStock: closing,
          movements,
        };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));

    const byType = await db
      .select({
        movementType: stockMovements.movementType,
        totalQty: sql<string>`coalesce(sum(${stockMovements.quantity}::numeric), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.businessId, businessId),
          gte(stockMovements.createdAt, start),
          lt(stockMovements.createdAt, end),
        ),
      )
      .groupBy(stockMovements.movementType)
      .orderBy(asc(stockMovements.movementType));

    return {
      fromDate,
      toDate,
      byProduct,
      rows: detailRows,
      byType: byType.map((t) => ({
        movementType: String(t.movementType),
        totalQty: Number(t.totalQty ?? 0),
        count: Number(t.count ?? 0),
      })),
    };
  }

  /**
   * Product × period matrix: one row per product, net qty columns by day/week/month.
   * Granularity from range length: ≤14d days, ≤90d weeks, else months.
   */
  async stockMovementMatrix(
    businessId: string,
    fromDate: string,
    toDate: string,
  ) {
    const { start, end } = nairobiDateRangeBounds(fromDate, toDate);
    const buckets = buildPeriodBuckets(fromDate, toDate);

    const openings = await db
      .select({
        productId: stockMovements.productId,
        opening: sql<string>`coalesce(sum(${stockMovements.quantity}::numeric), 0)`,
      })
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.businessId, businessId),
          lt(stockMovements.createdAt, start),
        ),
      )
      .groupBy(stockMovements.productId);
    const openingByProduct = new Map(
      openings.map((o) => [o.productId, Number(o.opening ?? 0)]),
    );

    const moves = await db
      .select({
        productId: stockMovements.productId,
        createdAt: stockMovements.createdAt,
        quantity: stockMovements.quantity,
        productName: products.name,
        sku: products.sku,
        costPrice: products.costPrice,
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .where(
        and(
          eq(stockMovements.businessId, businessId),
          gte(stockMovements.createdAt, start),
          lt(stockMovements.createdAt, end),
        ),
      );

    const salesLines = await db
      .select({
        productId: saleItems.productId,
        qty: sql<string>`coalesce(sum(coalesce(${saleItems.quantityStock}::numeric, ${saleItems.quantity}::numeric)), 0)`,
        revenue: sql<string>`coalesce(sum(${saleItems.total}::numeric), 0)`,
      })
      .from(saleItems)
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        and(
          eq(sales.businessId, businessId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, start),
          lt(sales.soldAt, end),
        ),
      )
      .groupBy(saleItems.productId);
    const salesByProduct = new Map(
      salesLines.map((s) => [
        s.productId,
        { qty: Number(s.qty ?? 0), revenue: Number(s.revenue ?? 0) },
      ]),
    );

    type Agg = {
      productId: string;
      productName: string;
      sku: string | null;
      costPrice: number;
      totalIn: number;
      totalOut: number;
      net: number;
      bucketNet: Record<string, number>;
    };
    const byId = new Map<string, Agg>();

    function ensure(
      productId: string,
      productName: string,
      sku: string | null,
      costPrice: number,
    ) {
      let a = byId.get(productId);
      if (!a) {
        a = {
          productId,
          productName,
          sku,
          costPrice,
          totalIn: 0,
          totalOut: 0,
          net: 0,
          bucketNet: Object.fromEntries(buckets.map((b) => [b.key, 0])),
        };
        byId.set(productId, a);
      }
      return a;
    }

    for (const m of moves) {
      const qty = Number(m.quantity ?? 0);
      const a = ensure(
        m.productId,
        m.productName,
        m.sku,
        Number(m.costPrice ?? 0),
      );
      if (qty >= 0) a.totalIn += qty;
      else a.totalOut += Math.abs(qty);
      a.net += qty;
      const key = bucketKeyForDate(m.createdAt, buckets);
      if (key) a.bucketNet[key] = (a.bucketNet[key] ?? 0) + qty;
    }

    const missingIds = [
      ...new Set([
        ...[...openingByProduct.entries()]
          .filter(([pid, o]) => !byId.has(pid) && o !== 0)
          .map(([pid]) => pid),
        ...[...salesByProduct.entries()]
          .filter(([pid, s]) => !byId.has(pid) && (s.qty !== 0 || s.revenue !== 0))
          .map(([pid]) => pid),
      ]),
    ];
    if (missingIds.length > 0) {
      const extras = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          costPrice: products.costPrice,
        })
        .from(products)
        .where(
          and(
            eq(products.businessId, businessId),
            inArray(products.id, missingIds),
          ),
        );
      for (const prod of extras) {
        ensure(
          prod.id,
          prod.name,
          prod.sku,
          Number(prod.costPrice ?? 0),
        );
      }
    }

    const rows = [...byId.values()]
      .map((a, idx) => {
        const opening = openingByProduct.get(a.productId) ?? 0;
        const closing = opening + a.net;
        const sale = salesByProduct.get(a.productId) ?? {
          qty: 0,
          revenue: 0,
        };
        const cost = sale.qty * a.costPrice;
        const margin = sale.revenue - cost;
        return {
          serial: 0, // filled after sort
          productId: a.productId,
          productName: a.productName,
          sku: a.sku,
          opening,
          totalIn: a.totalIn,
          totalOut: a.totalOut,
          net: a.net,
          buckets: buckets.map((b) => ({
            key: b.key,
            label: b.label,
            net: a.bucketNet[b.key] ?? 0,
          })),
          closing,
          salesQty: sale.qty,
          salesAmount: sale.revenue,
          cost,
          margin,
          marginPct: sale.revenue > 0 ? (margin / sale.revenue) * 100 : 0,
        };
      })
      .sort((x, y) => x.productName.localeCompare(y.productName))
      .map((r, i) => ({ ...r, serial: i + 1 }));

    return {
      fromDate,
      toDate,
      granularity: buckets[0]?.granularity ?? "day",
      bucketLabels: buckets.map((b) => ({ key: b.key, label: b.label })),
      rows,
    };
  }

}

export const operationalReportsService = new OperationalReportsService();
