import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { sales } from "@/db/schema/sales/sales";
import { saleItems } from "@/db/schema/sales/sale_items";
import { products } from "@/db/schema/inventory/products";
import { saleItemBatches } from "@/db/schema/sales/sale_item_batches";
import { saleReturns } from "@/db/schema/sales/sale_returns";
import { customers } from "@/db/schema/sales/customers";

export class SalesQueryService {
  async listSales(
    businessId: string,
    opts?: { status?: string; limit?: number },
  ) {
    const conditions = [eq(sales.businessId, businessId)];
    if (opts?.status) {
      conditions.push(sql`${sales.status} = ${opts.status}`);
    }

    return db
      .select({
        id: sales.id,
        invoiceNumber: sales.invoiceNumber,
        status: sales.status,
        paymentStatus: sales.paymentStatus,
        subtotal: sales.subtotal,
        total: sales.total,
        amountPaid: sales.amountPaid,
        balanceDue: sales.balanceDue,
        soldAt: sales.soldAt,
        notes: sales.notes,
        customerId: sales.customerId,
        warehouseId: sales.warehouseId,
        branchId: sales.branchId,
      })
      .from(sales)
      .where(and(...conditions))
      .orderBy(desc(sales.soldAt))
      .limit(opts?.limit ?? 100);
  }

  async getSaleDetail(businessId: string, saleId: string) {
    const [sale] = await db
      .select()
      .from(sales)
      .where(and(eq(sales.id, saleId), eq(sales.businessId, businessId)))
      .limit(1);

    if (!sale) return null;

    const items = await db
      .select({
        id: saleItems.id,
        productId: saleItems.productId,
        quantity: saleItems.quantity,
        unitPrice: saleItems.unitPrice,
        discount: saleItems.discount,
        tax: saleItems.tax,
        total: saleItems.total,
        productName: products.name,
        sku: products.sku,
      })
      .from(saleItems)
      .innerJoin(products, eq(saleItems.productId, products.id))
      .where(eq(saleItems.saleId, saleId));

    const allBatches = [];
    for (const item of items) {
      const rows = await db
        .select()
        .from(saleItemBatches)
        .where(eq(saleItemBatches.saleItemId, item.id));
      allBatches.push(...rows);
    }

    return { sale, items, batches: allBatches };
  }

  async listReturns(businessId: string) {
    return db
      .select({
        id: saleReturns.id,
        returnNumber: saleReturns.returnNumber,
        reason: saleReturns.reason,
        total: saleReturns.total,
        saleId: saleReturns.saleId,
        createdAt: saleReturns.createdAt,
      })
      .from(saleReturns)
      .where(eq(saleReturns.businessId, businessId))
      .orderBy(desc(saleReturns.createdAt))
      .limit(100);
  }

  async listCustomers(businessId: string) {
    return db
      .select()
      .from(customers)
      .where(eq(customers.businessId, businessId))
      .orderBy(desc(customers.createdAt))
      .limit(200);
  }
}

export const salesQueryService = new SalesQueryService();
