import { and, eq, gte, lt, sql, desc, asc, isNotNull } from "drizzle-orm";

import type {
  AttentionItem,
  ExpiringBatchItem,
  LowStockItem,
  OwnerDashboard,
  SlowProductItem,
  TopProductItem,
} from "../types";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { payments } from "@/db/schema/sales/payments";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { expenses } from "@/db/schema/finance/expenses";
import { productBatches } from "@/db/schema/inventory/product_batches";

import { userRepository } from "@/repositories/users/user.repository";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { customerRepository } from "@/repositories/sales/customer.repository";
import { nairobiDayBounds } from "@/lib/timezone";
import { financeService } from "@/features/finance/services/finance.service";
import {
  countLowStockProducts,
  getLowStockProducts,
} from "@/features/inventory/queries/low-stock.query";

class DashboardService {
  async getOwnerDashboard(businessId: string): Promise<OwnerDashboard> {
    const { start: today, end: tomorrow } = nairobiDayBounds();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAhead = new Date(today);
    ninetyDaysAhead.setDate(ninetyDaysAhead.getDate() + 90);
    const todayStr = today.toISOString().slice(0, 10);
    const ninetyStr = ninetyDaysAhead.toISOString().slice(0, 10);

    const [
      branches,
      warehouses,
      users,
      productCount,
      suppliers,
      customers,
      todaySalesRow,
      lowStockRow,
      todayPayRows,
      arRow,
      apRow,
      tills,
      batchVal,
      plainVal,
      lowStockRows,
      expiringRows,
      topRows,
      slowRows,
    ] = await Promise.all([
      branchesRepository.count(businessId),
      warehousesRepository.count(businessId),
      userRepository.count(businessId),
      productRepository.count(businessId),
      supplierRepository.count(businessId),
      customerRepository.count(businessId),
      db
        .select({
          total: sql<string>`coalesce(sum(${sales.total}), 0)`,
          count: sql<number>`count(*)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, today),
            lt(sales.soldAt, tomorrow),
          ),
        ),
      countLowStockProducts(businessId).catch(() => 0),
      db
        .select({
          method: payments.method,
          total: sql<string>`coalesce(sum(${payments.amount}::numeric), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.businessId, businessId),
            eq(payments.status, "COMPLETED"),
            gte(payments.paidAt, today),
            lt(payments.paidAt, tomorrow),
          ),
        )
        .groupBy(payments.method),
      db
        .select({
          total: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
            sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
          ),
        ),
      db
        .select({
          total: sql<string>`coalesce(sum(${supplierInvoices.balanceDue}::numeric), 0)`,
        })
        .from(supplierInvoices)
        .where(
          and(
            eq(supplierInvoices.businessId, businessId),
            sql`coalesce(${supplierInvoices.balanceDue}::numeric, 0) > 0.009`,
          ),
        ),
      financeService.getCashAccountsWithBalances(businessId).catch(() => []),
      db
        .select({
          value: sql<string>`coalesce(sum(
            coalesce(${productBatches.quantityRemaining}::numeric, 0) *
            coalesce(${productBatches.costPrice}::numeric, 0)
          ), 0)`,
        })
        .from(productBatches)
        .where(
          and(
            eq(productBatches.businessId, businessId),
            sql`coalesce(${productBatches.quantityRemaining}::numeric, 0) > 0`,
            eq(productBatches.active, true),
          ),
        ),
      db
        .select({
          value: sql<string>`coalesce(sum(
            coalesce(${inventoryBalances.quantity}::numeric, 0) *
            coalesce(${products.costPrice}::numeric, 0)
          ), 0)`,
        })
        .from(inventoryBalances)
        .innerJoin(products, eq(inventoryBalances.productId, products.id))
        .where(
          and(
            eq(inventoryBalances.businessId, businessId),
            sql`coalesce(${inventoryBalances.quantity}::numeric, 0) > 0`,
          ),
        ),
      getLowStockProducts({ businessId }).catch(() => []),
      db
        .select({
          productId: products.id,
          productName: products.name,
          batchNumber: productBatches.batchNumber,
          expiryDate: productBatches.expiryDate,
          quantityRemaining: productBatches.quantityRemaining,
        })
        .from(productBatches)
        .innerJoin(products, eq(productBatches.productId, products.id))
        .where(
          and(
            eq(productBatches.businessId, businessId),
            eq(productBatches.active, true),
            isNotNull(productBatches.expiryDate),
            sql`coalesce(${productBatches.quantityRemaining}::numeric, 0) > 0`,
            sql`${productBatches.expiryDate}::date <= ${ninetyStr}::date`,
            sql`${productBatches.expiryDate}::date >= ${todayStr}::date`,
          ),
        )
        .orderBy(asc(productBatches.expiryDate))
        .limit(8)
        .catch(() => []),
      db
        .select({
          productId: products.id,
          name: products.name,
          revenue: sql<string>`coalesce(sum(${saleItems.total}::numeric), 0)`,
          quantity: sql<string>`coalesce(sum(coalesce(${saleItems.quantityStock}, ${saleItems.quantity})), 0)`,
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .innerJoin(products, eq(saleItems.productId, products.id))
        .where(
          and(
            eq(saleItems.businessId, businessId),
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, thirtyDaysAgo),
            lt(sales.soldAt, tomorrow),
          ),
        )
        .groupBy(products.id, products.name)
        .orderBy(desc(sql`coalesce(sum(${saleItems.total}::numeric), 0)`))
        .limit(5)
        .catch(() => []),
      db
        .select({
          productId: products.id,
          name: products.name,
          sku: products.sku,
          quantity: sql<string>`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`,
        })
        .from(products)
        .innerJoin(
          inventoryBalances,
          and(
            eq(inventoryBalances.productId, products.id),
            eq(inventoryBalances.businessId, businessId),
          ),
        )
        .where(
          and(
            eq(products.businessId, businessId),
            eq(products.active, true),
            eq(products.trackInventory, true),
            sql`not exists (
              select 1 from sale_items si
              inner join sales s on s.id = si.sale_id
              where si.product_id = ${products.id}
                and si.business_id = ${businessId}
                and s.status = 'COMPLETED'
                and s.sold_at >= ${thirtyDaysAgo}
            )`,
          ),
        )
        .groupBy(products.id, products.name, products.sku)
        .having(sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0) > 0`)
        .orderBy(desc(sql`coalesce(sum(${inventoryBalances.quantity}::numeric), 0)`))
        .limit(5)
        .catch(() => []),
    ]);

    const todaySales = Number(todaySalesRow[0]?.total ?? 0);
    const todayCount = Number(todaySalesRow[0]?.count ?? 0);
    const lowStock = Number(lowStockRow ?? 0);

    const seen = new Set<string>();
    let cashTotal = 0;
    for (const till of tills as { accountId: string; currentBalance: number }[]) {
      if (seen.has(till.accountId)) continue;
      seen.add(till.accountId);
      cashTotal += Number(till.currentBalance ?? 0);
    }

    const batchV = Number(batchVal[0]?.value ?? 0);
    const plainV = Number(plainVal[0]?.value ?? 0);
    const stockValue = batchV > 0.01 ? batchV : plainV;

    const todayCashByMethod = (todayPayRows as { method: string; total: string }[]).map(
      (r) => ({
        method: String(r.method),
        total: Number(r.total ?? 0),
      }),
    );
    const todayCashIn = todayCashByMethod.reduce((s, r) => s + r.total, 0);
    const openAr = Number(arRow[0]?.total ?? 0);
    const openAp = Number(apRow[0]?.total ?? 0);

    const [arCountRow, apCountRow, expAgg] = await Promise.all([
      db
        .select({ c: sql<number>`count(*)` })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
            sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
          ),
        )
        .catch(() => [{ c: 0 }]),
      db
        .select({ c: sql<number>`count(*)` })
        .from(supplierInvoices)
        .where(
          and(
            eq(supplierInvoices.businessId, businessId),
            sql`coalesce(${supplierInvoices.balanceDue}::numeric, 0) > 0.009`,
          ),
        )
        .catch(() => [{ c: 0 }]),
      db
        .select({
          c: sql<number>`count(*)`,
          total: sql<string>`coalesce(sum(${expenses.amount}::numeric), 0)`,
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.businessId, businessId),
            gte(expenses.expenseDate, today),
            sql`${expenses.expenseDate} < ${today}::timestamptz + interval '30 days'`,
          ),
        )
        .catch(() => [{ c: 0, total: "0" }]),
    ]);
    const openArCount = Number(arCountRow[0]?.c ?? 0);
    const openApCount = Number(apCountRow[0]?.c ?? 0);
    const upcomingExpenseCount = Number(expAgg[0]?.c ?? 0);
    const upcomingExpenseTotal = Number(expAgg[0]?.total ?? 0);


    const lowMap = new Map<string, LowStockItem>();
    for (const r of lowStockRows as {
      productId: string;
      productName: string;
      sku: string | null;
      currentQuantity: number;
      reorderLevel: number | null;
    }[]) {
      const qty = Number(r.currentQuantity ?? 0);
      const existing = lowMap.get(r.productId);
      if (!existing || qty < existing.quantity) {
        lowMap.set(r.productId, {
          productId: r.productId,
          name: r.productName,
          sku: r.sku,
          quantity: qty,
          reorderLevel: Number(r.reorderLevel ?? 0),
        });
      }
    }
    const lowStockItems = Array.from(lowMap.values())
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 8);

    const expiringBatches: ExpiringBatchItem[] = (
      expiringRows as {
        productId: string;
        productName: string;
        batchNumber: string;
        expiryDate: string | Date | null;
        quantityRemaining: number | string | null;
      }[]
    ).map((r) => ({
      productId: r.productId,
      productName: r.productName,
      batchNumber: r.batchNumber,
      expiryDate:
        r.expiryDate != null && typeof r.expiryDate === "object" && "toISOString" in (r.expiryDate as object)
          ? (r.expiryDate as Date).toISOString().slice(0, 10)
          : String(r.expiryDate ?? "").slice(0, 10),
      quantityRemaining: Number(r.quantityRemaining ?? 0),
    }));

    const topProducts: TopProductItem[] = (
      topRows as {
        productId: string;
        name: string;
        revenue: string;
        quantity: string;
      }[]
    ).map((r) => ({
      productId: r.productId,
      name: r.name,
      revenue: Number(r.revenue ?? 0),
      quantity: Number(r.quantity ?? 0),
    }));

    const slowProducts: SlowProductItem[] = (
      slowRows as {
        productId: string;
        name: string;
        sku: string | null;
        quantity: string;
      }[]
    ).map((r) => ({
      productId: r.productId,
      name: r.name,
      sku: r.sku,
      quantity: Number(r.quantity ?? 0),
      daysWithoutSale: 30,
    }));

    const attention: AttentionItem[] = [
      lowStockItems.length > 0
        ? {
            kind: "restock" as const,
            title: `${lowStockItems.length} product${lowStockItems.length === 1 ? "" : "s"} need restock`,
            detail: lowStockItems
              .slice(0, 3)
              .map((i) => i.name)
              .join(", "),
            href: "/dashboard/attention?kind=restock",
          }
        : {
            kind: "restock" as const,
            title: "Restock · stock levels healthy",
            detail: "No products at or below reorder level",
            href: "/dashboard/attention?kind=restock",
          },
      expiringBatches.length > 0
        ? {
            kind: "expiry" as const,
            title: `${expiringBatches.length} batch${expiringBatches.length === 1 ? "" : "es"} expiring within 90 days`,
            detail: expiringBatches
              .slice(0, 2)
              .map((b) => `${b.productName} (${b.expiryDate})`)
              .join(" · "),
            href: "/dashboard/attention?kind=expiry",
          }
        : {
            kind: "expiry" as const,
            title: "Expiry · no batches in next 90 days",
            detail: "Open to review batch list anytime",
            href: "/dashboard/attention?kind=expiry",
          },
      {
        kind: "receivable" as const,
        title:
          openAr > 0.5
            ? `Collect debts · KES ${openAr.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "Collect debts · nothing outstanding",
        detail:
          openArCount > 0
            ? `${openArCount} open credit invoice${openArCount === 1 ? "" : "s"} — follow up collections`
            : "No open customer balances",
        href: "/dashboard/attention?kind=receivable",
      },
      {
        kind: "payable" as const,
        title:
          openAp > 0.5
            ? `Pay suppliers · KES ${openAp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : "Pay suppliers · nothing outstanding",
        detail:
          openApCount > 0
            ? `${openApCount} unpaid supplier invoice${openApCount === 1 ? "" : "s"} — due dates inside`
            : "No open supplier balances",
        href: "/dashboard/attention?kind=payable",
      },
      {
        kind: "expense" as const,
        title:
          upcomingExpenseCount > 0
            ? `Expenses · ${upcomingExpenseCount} in next 30 days`
            : "Expenses · next 30 days",
        detail:
          upcomingExpenseCount > 0
            ? `KES ${upcomingExpenseTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} scheduled / dated ahead`
            : "Review recent and upcoming expense dates",
        href: "/dashboard/attention?kind=expense",
      },
      slowProducts.length > 0 && stockValue > 0
        ? {
            kind: "slow" as const,
            title: `${slowProducts.length} stocked item${slowProducts.length === 1 ? "" : "s"} with no sales in 30 days`,
            detail: slowProducts
              .slice(0, 3)
              .map((x) => x.name)
              .join(", "),
            href: "/dashboard/attention?kind=slow",
          }
        : {
            kind: "slow" as const,
            title: "Slow stock · none flagged",
            detail: "No stocked items without sales in 30 days",
            href: "/dashboard/attention?kind=slow",
          },
    ];

    return {
      summary: {
        branches,
        warehouses,
        users,
        products: productCount,
        suppliers,
        customers,
        todaySales,
        lowStock,
        todaySalesCount: todayCount,
        cashTotal,
        openAr,
        openAp,
        stockValue,
        todayCashIn,
        todayCashByMethod,
        upcomingExpenseCount,
        upcomingExpenseTotal,
        openArCount,
        openApCount,
      },
      attention,
      lowStockItems,
      expiringBatches,
      topProducts,
      slowProducts,
    };
  }
}

export const dashboardService = new DashboardService();
