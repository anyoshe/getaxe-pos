import { and, eq, gte, lt, sql } from "drizzle-orm";

import type { OwnerDashboard } from "../types";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { payments } from "@/db/schema/sales/payments";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { productBatches } from "@/db/schema/inventory/product_batches";

import { userRepository } from "@/repositories/users/user.repository";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { customerRepository } from "@/repositories/sales/customer.repository";
import { nairobiDayBounds } from "@/lib/timezone";
import { financeService } from "@/features/finance/services/finance.service";
import { countLowStockProducts } from "@/features/inventory/queries/low-stock.query";


class DashboardService {
  async getOwnerDashboard(businessId: string): Promise<OwnerDashboard> {
    const { start: today, end: tomorrow } = nairobiDayBounds();

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
        openAr: Number(arRow[0]?.total ?? 0),
        openAp: Number(apRow[0]?.total ?? 0),
        stockValue,
        todayCashIn,
        todayCashByMethod,
      },
    };
  }
}

export const dashboardService = new DashboardService();
