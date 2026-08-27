import { and, eq, gte, lt, sql } from "drizzle-orm";

import type { OwnerDashboard } from "../types";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { products } from "@/db/schema/inventory/products";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";

import { userRepository } from "@/repositories/users/user.repository";
import { branchesRepository } from "@/repositories/settings/branches.repository";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";
import { productRepository } from "@/repositories/inventory/products.repository";
import { supplierRepository } from "@/repositories/inventory/suppliers.repository";
import { customerRepository } from "@/repositories/sales/customer.repository";
import { nairobiDayBounds } from "@/lib/timezone";


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
      // Products with trackInventory where sum of balances <= reorder_level
      db
        .select({
          count: sql<number>`count(*)::int`,
        })
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
    ]);

    const todaySales = Number(todaySalesRow[0]?.total ?? 0);
    const todayCount = Number(todaySalesRow[0]?.count ?? 0);
    const lowStock = Number(lowStockRow[0]?.count ?? 0);

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
      },
    };
  }
}

export const dashboardService = new DashboardService();
