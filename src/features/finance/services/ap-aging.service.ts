import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { purchaseOrders } from "@/db/schema/purchasing/purchase_orders";
import { suppliers } from "@/db/schema/inventory/suppliers";

/**
 * Simple AP aging from open purchase orders (APPROVED / PARTIAL / ORDERED)
 * that still have unreceived or unpaid value — operational view until full AP invoices.
 */
export async function getApAging(businessId: string) {
  const rows = await db
    .select({
      id: purchaseOrders.id,
      orderNumber: purchaseOrders.orderNumber,
      status: purchaseOrders.status,
      total: purchaseOrders.total,
      orderDate: purchaseOrders.orderedAt,
      supplierId: purchaseOrders.supplierId,
      supplierName: suppliers.name,
    })
    .from(purchaseOrders)
    .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
    .where(
      and(
        eq(purchaseOrders.businessId, businessId),
        sql`${purchaseOrders.status} NOT IN ('CANCELLED', 'DRAFT', 'RECEIVED')`,
      ),
    )
    .catch(() => []);

  const now = Date.now();
  const buckets = {
    current: 0,
    d30: 0,
    d60: 0,
    d90: 0,
    older: 0,
  };

  const detail = rows.map((r) => {
    const total = Number(r.total ?? 0);
    const days = r.orderDate
      ? Math.floor((now - new Date(r.orderDate).getTime()) / 86400000)
      : 0;
    let bucket: keyof typeof buckets = "current";
    if (days <= 30) bucket = "current";
    else if (days <= 60) bucket = "d30";
    else if (days <= 90) bucket = "d60";
    else if (days <= 120) bucket = "d90";
    else bucket = "older";
    buckets[bucket] += total;
    return {
      id: r.id,
      orderNumber: r.orderNumber ?? r.id.slice(0, 8),
      supplierName: r.supplierName ?? "—",
      status: String(r.status),
      total,
      days,
      bucket,
      orderDate: r.orderDate,
    };
  });

  return { buckets, detail };
}

export async function listJournals(businessId: string, limit = 50) {
  const { journalEntries } = await import(
    "@/db/schema/finance/journal_entries"
  );
  const { desc } = await import("drizzle-orm");
  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.businessId, businessId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit)
    .catch(() => []);
}
