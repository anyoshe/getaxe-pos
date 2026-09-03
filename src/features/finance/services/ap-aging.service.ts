import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { purchaseOrders } from "@/db/schema/purchasing/purchase_orders";
import { suppliers } from "@/db/schema/inventory/suppliers";
import { journalEntries } from "@/db/schema/finance/journal_entries";
import { journalEntryLines } from "@/db/schema/finance/journal_entry_lines";
import { chartOfAccounts } from "@/db/schema/finance/chart_of_accounts";
import { supplierInvoiceService } from "@/features/purchases/services/supplier-invoice.service";
import { goodsReceipts } from "@/db/schema/purchasing/goods_receipts";
import { sales } from "@/db/schema/sales/sales";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";


export async function getApAging(businessId: string) {
  // Prefer true AP invoices when present
  try {
    const fromInvoices = await supplierInvoiceService.aging(businessId);
    if (fromInvoices.detail.length > 0) {
      return {
        source: "supplier_invoices" as const,
        buckets: fromInvoices.buckets,
        detail: fromInvoices.detail.map((d) => ({
          id: d.id,
          orderNumber: d.invoiceNumber,
          supplierName: d.supplierName,
          status: d.status,
          total: d.balanceDue,
          days: d.days,
          bucket: "current" as string,
          orderDate: null as Date | null,
        })),
      };
    }
  } catch {
    // fall through to PO-based aging
  }

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
        sql`${purchaseOrders.status} NOT IN ('CANCELLED', 'DRAFT', 'RECEIVED', 'CLOSED')`,
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

  return { source: "purchase_orders" as const, buckets, detail };
}

export async function listJournals(businessId: string, limit = 80) {
  const entries = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.businessId, businessId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit)
    .catch(() => []);

  if (entries.length === 0) return [];

  const ids = entries.map((e) => e.id);
  const lines = await db
    .select({
      id: journalEntryLines.id,
      journalEntryId: journalEntryLines.journalEntryId,
      lineNumber: journalEntryLines.lineNumber,
      description: journalEntryLines.description,
      debit: journalEntryLines.debit,
      credit: journalEntryLines.credit,
      accountId: journalEntryLines.accountId,
      accountCode: chartOfAccounts.accountCode,
      accountName: chartOfAccounts.accountName,
    })
    .from(journalEntryLines)
    .leftJoin(
      chartOfAccounts,
      eq(journalEntryLines.accountId, chartOfAccounts.id),
    )
    .where(inArray(journalEntryLines.journalEntryId, ids))
    .orderBy(asc(journalEntryLines.lineNumber))
    .catch(() => []);

  const byEntry = new Map<string, typeof lines>();
  for (const line of lines) {
    const list = byEntry.get(line.journalEntryId) ?? [];
    list.push(line);
    byEntry.set(line.journalEntryId, list);
  }

  // Resolve human-readable document numbers for sourceId / UUID references
  const sourceIds = [...new Set(entries.map((e) => e.sourceId).filter(Boolean))];
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const saleMap = new Map<string, string>();
  const grnMap = new Map<string, string>();
  const invMap = new Map<string, string>();
  const poMap = new Map<string, string>();

  if (sourceIds.length > 0) {
    const [saleRows, grnRows, invRows, poRows] = await Promise.all([
      db
        .select({ id: sales.id, invoiceNumber: sales.invoiceNumber })
        .from(sales)
        .where(inArray(sales.id, sourceIds))
        .catch(() => []),
      db
        .select({ id: goodsReceipts.id, receiptNumber: goodsReceipts.receiptNumber })
        .from(goodsReceipts)
        .where(inArray(goodsReceipts.id, sourceIds))
        .catch(() => []),
      db
        .select({
          id: supplierInvoices.id,
          invoiceNumber: supplierInvoices.invoiceNumber,
        })
        .from(supplierInvoices)
        .where(inArray(supplierInvoices.id, sourceIds))
        .catch(() => []),
      db
        .select({ id: purchaseOrders.id, orderNumber: purchaseOrders.orderNumber })
        .from(purchaseOrders)
        .where(inArray(purchaseOrders.id, sourceIds))
        .catch(() => []),
    ]);
    for (const r of saleRows) saleMap.set(r.id, r.invoiceNumber);
    for (const r of grnRows) grnMap.set(r.id, r.receiptNumber);
    for (const r of invRows) invMap.set(r.id, r.invoiceNumber);
    for (const r of poRows) poMap.set(r.id, r.orderNumber ?? r.id.slice(0, 8));
  }

  function humanRef(
    sourceType: string,
    sourceId: string,
    reference: string | null,
  ): string {
    if (reference && !uuidRe.test(reference.trim())) return reference.trim();
    if (sourceType === "SALE" && saleMap.get(sourceId))
      return saleMap.get(sourceId)!;
    if (sourceType === "PURCHASE") {
      if (grnMap.get(sourceId)) return grnMap.get(sourceId)!;
      if (invMap.get(sourceId)) return invMap.get(sourceId)!;
      if (poMap.get(sourceId)) return poMap.get(sourceId)!;
    }
    if (sourceType === "PAYMENT" && invMap.get(sourceId))
      return invMap.get(sourceId)!;
    if (reference && uuidRe.test(reference)) return reference.slice(0, 8);
    if (uuidRe.test(sourceId)) return sourceId.slice(0, 8);
    return reference ?? sourceId;
  }

  function friendlyDescription(
    sourceType: string,
    description: string,
    label: string,
  ): string {
    let d = description ?? "";
    // Replace any UUID substrings with the resolved label when present
    d = d.replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
      label,
    );
    if (!d.trim()) {
      if (sourceType === "SALE") return `POS sale ${label}`;
      if (sourceType === "PURCHASE") return `Purchase / GRN ${label}`;
      if (sourceType === "PAYMENT") return `Payment ${label}`;
      return label;
    }
    return d;
  }

  return entries.map((e) => {
    const entryLines = byEntry.get(e.id) ?? [];
    const totalDebit = entryLines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
    const totalCredit = entryLines.reduce(
      (s, l) => s + Number(l.credit ?? 0),
      0,
    );
    const docLabel = humanRef(
      String(e.sourceType),
      e.sourceId,
      e.reference,
    );
    return {
      id: e.id,
      journalNumber: e.journalNumber,
      transactionDate: e.transactionDate,
      sourceType: e.sourceType,
      status: e.status,
      reference: docLabel,
      description: friendlyDescription(
        String(e.sourceType),
        e.description,
        docLabel,
      ),
      totalDebit,
      totalCredit,
      lines: entryLines.map((l) => {
        let lineDesc = l.description ?? "";
        lineDesc = lineDesc.replace(
          /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi,
          docLabel,
        );
        return {
          id: l.id,
          lineNumber: l.lineNumber,
          accountCode: l.accountCode ?? "—",
          accountName: l.accountName ?? "Unknown account",
          description: lineDesc,
          debit: Number(l.debit ?? 0),
          credit: Number(l.credit ?? 0),
        };
      }),
    };
  });
}
