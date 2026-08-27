import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { payments } from "@/db/schema/sales/payments";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { stockMovements } from "@/db/schema/inventory/stock_movements";
import { expenses } from "@/db/schema/finance/expenses";
import { incomes } from "@/db/schema/finance/incomes";
import { activityLogs } from "@/db/schema/infrastructure/activity_logs";
import { nairobiPeriodBounds } from "@/lib/timezone";

export type ReportPeriod = "day" | "week" | "month";

export class ReportsOverviewService {
  async getOverview(businessId: string, period: ReportPeriod = "day") {
    const { start, end, label } = nairobiPeriodBounds(period);

    const [
      salesAgg,
      salesByDay,
      paymentsByMethod,
      expenseAgg,
      incomeAgg,
      movementAgg,
      stockValue,
      lowStock,
      recentActivity,
      topProducts,
    ] = await Promise.all([
      db
        .select({
          total: sql<string>`coalesce(sum(${sales.total}), 0)`,
          count: sql<number>`count(*)::int`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, start),
            lt(sales.soldAt, end),
          ),
        ),

      db
        .select({
          day: sql<string>`to_char(${sales.soldAt}, 'YYYY-MM-DD')`,
          total: sql<string>`coalesce(sum(${sales.total}), 0)`,
          count: sql<number>`count(*)::int`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, start),
            lt(sales.soldAt, end),
          ),
        )
        .groupBy(sql`to_char(${sales.soldAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${sales.soldAt}, 'YYYY-MM-DD')`),

      db
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
        .groupBy(payments.method),

      db
        .select({
          total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
          count: sql<number>`count(*)::int`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.businessId, businessId),
            gte(expenses.expenseDate, start),
            lt(expenses.expenseDate, end),
          ),
        ),

      db
        .select({
          total: sql<string>`coalesce(sum(${incomes.amount}), 0)`,
          count: sql<number>`count(*)::int`,
        })
        .from(incomes)
        .where(
          and(
            eq(incomes.businessId, businessId),
            gte(incomes.incomeDate, start),
            lt(incomes.incomeDate, end),
          ),
        ),

      db
        .select({
          movementType: stockMovements.movementType,
          totalQty: sql<string>`coalesce(sum(${stockMovements.quantity}), 0)`,
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
        .groupBy(stockMovements.movementType),

      db
        .select({
          qty: sql<string>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
        })
        .from(inventoryBalances)
        .where(eq(inventoryBalances.businessId, businessId)),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(
          and(
            eq(products.businessId, businessId),
            eq(products.active, true),
            eq(products.trackInventory, true),
            sql`(
              select coalesce(sum(${inventoryBalances.quantity}), 0)
              from ${inventoryBalances}
              where ${inventoryBalances.productId} = ${products.id}
                and ${inventoryBalances.businessId} = ${businessId}
            ) <= coalesce(${products.reorderLevel}, 0)`,
          ),
        ),

      db
        .select({
          action: activityLogs.action,
          entity: activityLogs.entity,
          description: activityLogs.description,
          createdAt: activityLogs.createdAt,
        })
        .from(activityLogs)
        .where(
          and(
            eq(activityLogs.businessId, businessId),
            gte(activityLogs.createdAt, start),
            lt(activityLogs.createdAt, end),
          ),
        )
        .orderBy(desc(activityLogs.createdAt))
        .limit(20),

      db
        .select({
          productId: saleItems.productId,
          productName: products.name,
          qty: sql<string>`coalesce(sum(${saleItems.quantity}), 0)`,
          revenue: sql<string>`coalesce(sum(${saleItems.total}), 0)`,
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
        .groupBy(saleItems.productId, products.name)
        .orderBy(sql`sum(${saleItems.total}) desc`)
        .limit(8),
    ]);

    const salesTotal = Number(salesAgg[0]?.total ?? 0);
    const salesCount = Number(salesAgg[0]?.count ?? 0);
    const expenseTotal = Number(expenseAgg[0]?.total ?? 0);
    const incomeTotal = Number(incomeAgg[0]?.total ?? 0);
    // Approx net: sales + other income - expenses (COGS not fully journaled yet)
    const netCash = salesTotal + incomeTotal - expenseTotal;

    return {
      period,
      periodLabel: label,
      start: start.toISOString(),
      end: end.toISOString(),
      sales: {
        total: salesTotal,
        count: salesCount,
        byDay: salesByDay.map((r) => ({
          day: r.day,
          total: Number(r.total),
          count: Number(r.count),
        })),
        topProducts: topProducts.map((r) => ({
          productId: r.productId,
          name: r.productName,
          qty: Number(r.qty),
          revenue: Number(r.revenue),
        })),
      },
      payments: {
        byMethod: paymentsByMethod.map((r) => ({
          method: String(r.method),
          total: Number(r.total),
          count: Number(r.count),
        })),
      },
      finance: {
        expenses: expenseTotal,
        otherIncome: incomeTotal,
        netCash,
      },
      inventory: {
        onHandQty: Number(stockValue[0]?.qty ?? 0),
        lowStockCount: Number(lowStock[0]?.count ?? 0),
        movements: movementAgg.map((r) => ({
          type: String(r.movementType),
          qty: Number(r.totalQty),
          count: Number(r.count),
        })),
      },
      audit: recentActivity.map((a) => ({
        action: String(a.action),
        entity: String(a.entity),
        description: a.description,
        createdAt: a.createdAt,
      })),
    };
  }
}

export const reportsOverviewService = new ReportsOverviewService();
