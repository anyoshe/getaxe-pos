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


const ACCOUNT_LABELS: Record<string, string> = {
  "1000": "Cash on Hand",
  "1100": "Bank",
  "1200": "Inventory Asset",
  "1300": "Accounts Receivable",
  "2000": "Accounts Payable",
  "4000": "Sales Revenue",
  "5000": "Cost of Goods Sold",
  "6000": "Operating Expense",
};

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function stripUuids(text: string | null | undefined, replacement = ""): string {
  if (!text) return "";
  return String(text)
    .replace(UUID_RE, replacement)
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function listJournals(businessId: string, limit = 80) {
  const entries = await db
    .select({
      id: journalEntries.id,
      journalNumber: journalEntries.journalNumber,
      transactionDate: journalEntries.transactionDate,
      description: journalEntries.description,
      reference: journalEntries.reference,
      sourceType: journalEntries.sourceType,
      sourceId: journalEntries.sourceId,
      status: journalEntries.status,
    })
    .from(journalEntries)
    .where(eq(journalEntries.businessId, businessId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit)
    .catch(() => []);

  if (entries.length === 0) return [];

  const ids = entries.map((e) => e.id);

  let lines: Array<{
    id: string;
    journalEntryId: string;
    lineNumber: number;
    description: string | null;
    debit: string;
    credit: string;
    accountId: string;
    accountCode: string | null;
    accountName: string | null;
  }> = [];

  try {
    lines = await db
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
      .orderBy(asc(journalEntryLines.lineNumber));
  } catch {
    lines = [];
  }

  const missingAccountIds = [
    ...new Set(
      lines
        .filter((l) => !l.accountCode || !l.accountName)
        .map((l) => l.accountId)
        .filter(Boolean),
    ),
  ];
  const accountFallback = new Map<string, { code: string; name: string }>();
  if (missingAccountIds.length > 0) {
    const acctRows = await db
      .select({
        id: chartOfAccounts.id,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
      })
      .from(chartOfAccounts)
      .where(inArray(chartOfAccounts.id, missingAccountIds))
      .catch(() => []);
    for (const a of acctRows) {
      accountFallback.set(a.id, { code: a.accountCode, name: a.accountName });
    }
  }

  const byEntry = new Map<string, typeof lines>();
  for (const line of lines) {
    const list = byEntry.get(line.journalEntryId) ?? [];
    list.push(line);
    byEntry.set(line.journalEntryId, list);
  }

  const sourceIds = [
    ...new Set(entries.map((e) => e.sourceId).filter(Boolean) as string[]),
  ];

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
        .select({
          id: goodsReceipts.id,
          receiptNumber: goodsReceipts.receiptNumber,
        })
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
        .select({
          id: purchaseOrders.id,
          orderNumber: purchaseOrders.orderNumber,
        })
        .from(purchaseOrders)
        .where(inArray(purchaseOrders.id, sourceIds))
        .catch(() => []),
    ]);
    for (const r of saleRows) {
      if (r.invoiceNumber) saleMap.set(r.id, r.invoiceNumber);
    }
    for (const r of grnRows) {
      if (r.receiptNumber) grnMap.set(r.id, r.receiptNumber);
    }
    for (const r of invRows) {
      if (r.invoiceNumber) invMap.set(r.id, r.invoiceNumber);
    }
    for (const r of poRows) {
      poMap.set(r.id, r.orderNumber || "PO");
    }
  }

  function docLabel(
    sourceType: string,
    sourceId: string,
    reference: string | null,
  ): string {
    if (reference && !isUuid(reference)) return reference.trim();
    if (sourceType === "SALE" && saleMap.get(sourceId)) {
      return saleMap.get(sourceId)!;
    }
    if (sourceType === "PURCHASE") {
      return (
        grnMap.get(sourceId) ||
        invMap.get(sourceId) ||
        poMap.get(sourceId) ||
        "Purchase"
      );
    }
    if (sourceType === "PAYMENT") {
      return invMap.get(sourceId) || "Payment";
    }
    if (reference && !isUuid(reference)) return reference;
    return String(sourceType).replace(/_/g, " ");
  }

  return entries.map((e) => {
    const entryLines = byEntry.get(e.id) ?? [];
    const totalDebit = entryLines.reduce((s, l) => s + Number(l.debit ?? 0), 0);
    const totalCredit = entryLines.reduce(
      (s, l) => s + Number(l.credit ?? 0),
      0,
    );
    const label = docLabel(String(e.sourceType), e.sourceId, e.reference);

    let description = stripUuids(e.description, ` ${label} `);
    description = description.replace(/\s{2,}/g, " ").trim();
    if (!description) {
      if (e.sourceType === "SALE") description = `POS sale ${label}`;
      else if (e.sourceType === "PURCHASE")
        description = `Goods / purchase ${label}`;
      else if (e.sourceType === "PAYMENT") description = `Payment ${label}`;
      else description = label;
    }

    const journalNumber = isUuid(e.journalNumber)
      ? `JV-${e.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
      : e.journalNumber;

    return {
      id: e.id,
      journalNumber,
      transactionDate: e.transactionDate,
      sourceType: e.sourceType,
      status: e.status,
      reference: label,
      description,
      totalDebit,
      totalCredit,
      lines: entryLines.map((l) => {
        const fb = accountFallback.get(l.accountId);
        let code = l.accountCode || fb?.code || "";
        let name = l.accountName || fb?.name || "";
        if (isUuid(code)) code = "";
        if (isUuid(name)) name = "";
        if (!name && code && ACCOUNT_LABELS[code]) name = ACCOUNT_LABELS[code];
        if (!code) code = "—";
        if (!name) name = ACCOUNT_LABELS[code] || "Account";
        return {
          id: l.id,
          lineNumber: l.lineNumber,
          accountCode: code,
          accountName: name,
          description: stripUuids(l.description, label) || "—",
          debit: Number(l.debit ?? 0),
          credit: Number(l.credit ?? 0),
        };
      }),
    };
  });
}
