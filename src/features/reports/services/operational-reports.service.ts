import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { stockMovements } from "@/db/schema/inventory/stock_movements";
import { warehouses } from "@/db/schema/settings/warehouses";
import { saleItems } from "@/db/schema/sales/sale_items";
import { sales } from "@/db/schema/sales/sales";
import { payments } from "@/db/schema/sales/payments";

function parseDayStart(dateStr: string) {
  return new Date(`${dateStr}T00:00:00+03:00`);
}

function parseDayEndExclusive(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00+03:00`);
  d.setDate(d.getDate() + 1);
  return d;
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
    const start = parseDayStart(fromDate);
    const end = parseDayEndExclusive(toDate);

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
    const start = parseDayStart(fromDate);
    const end = parseDayEndExclusive(toDate);

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
        const qtyIn = movements
          .filter((m) => m.quantity > 0)
          .reduce((s, m) => s + m.quantity, 0);
        const qtyOut = movements
          .filter((m) => m.quantity < 0)
          .reduce((s, m) => s + Math.abs(m.quantity), 0);
        const net = qtyIn - qtyOut; // same as sum of signed qty
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
}

export const operationalReportsService = new OperationalReportsService();
