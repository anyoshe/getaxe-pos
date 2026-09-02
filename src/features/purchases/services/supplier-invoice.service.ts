import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { supplierInvoices } from "@/db/schema/purchasing/supplier_invoices";
import { suppliers } from "@/db/schema/inventory/suppliers";
import { journalPostingService } from "@/features/finance/services/journal-posting.service";

export class SupplierInvoiceService {
  async list(businessId: string) {
    return db
      .select({
        id: supplierInvoices.id,
        invoiceNumber: supplierInvoices.invoiceNumber,
        invoiceDate: supplierInvoices.invoiceDate,
        dueDate: supplierInvoices.dueDate,
        status: supplierInvoices.status,
        total: supplierInvoices.total,
        amountPaid: supplierInvoices.amountPaid,
        balanceDue: supplierInvoices.balanceDue,
        currency: supplierInvoices.currency,
        supplierId: supplierInvoices.supplierId,
        supplierName: suppliers.name,
      })
      .from(supplierInvoices)
      .leftJoin(suppliers, eq(supplierInvoices.supplierId, suppliers.id))
      .where(eq(supplierInvoices.businessId, businessId))
      .orderBy(desc(supplierInvoices.invoiceDate));
  }

  async create(input: {
    businessId: string;
    supplierId: string;
    purchaseOrderId?: string | null;
    invoiceNumber: string;
    invoiceDate?: Date;
    dueDate?: Date | null;
    total: number;
    tax?: number;
    currency?: string;
    notes?: string | null;
    createdBy?: string | null;
    /** When true, skip CoA post (e.g. GRN already posted Dr Inventory / Cr AP). */
    skipJournal?: boolean;
  }) {
    const total = input.total;
    const tax = input.tax ?? 0;
    const subtotal = total - tax;

    const [row] = await db
      .insert(supplierInvoices)
      .values({
        businessId: input.businessId,
        supplierId: input.supplierId,
        purchaseOrderId: input.purchaseOrderId ?? null,
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate ?? new Date(),
        dueDate: input.dueDate ?? null,
        status: "OPEN",
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        amountPaid: "0",
        balanceDue: total.toFixed(2),
        currency: input.currency ?? "KES",
        notes: input.notes ?? null,
        createdBy: input.createdBy ?? null,
      })
      .returning();

    if (!input.skipJournal) {
      // Dr Inventory, Cr AP — skip when GRN already posted the same entry
      await journalPostingService.post({
        businessId: input.businessId,
        sourceType: "PURCHASE",
        sourceId: row.id,
        description: `Supplier invoice ${row.invoiceNumber}`,
        reference: row.invoiceNumber,
        postedBy: input.createdBy,
        lines: [
          {
            accountCode: "1200",
            debit: total.toFixed(2),
            description: `Supplier inv ${row.invoiceNumber}`,
          },
          {
            accountCode: "2000",
            credit: total.toFixed(2),
            description: `AP ${row.invoiceNumber}`,
          },
        ],
      });
    }

    return row;
  }

  async recordPayment(input: {
    businessId: string;
    invoiceId: string;
    amount: number;
    createdBy?: string | null;
  }) {
    const [inv] = await db
      .select()
      .from(supplierInvoices)
      .where(
        and(
          eq(supplierInvoices.id, input.invoiceId),
          eq(supplierInvoices.businessId, input.businessId),
        ),
      )
      .limit(1);

    if (!inv) throw new Error("Invoice not found");

    const paid = Number(inv.amountPaid) + input.amount;
    const total = Number(inv.total);
    const balance = Math.max(0, total - paid);
    const status =
      balance <= 0.009 ? "PAID" : paid > 0 ? "PARTIAL" : inv.status;

    const [updated] = await db
      .update(supplierInvoices)
      .set({
        amountPaid: paid.toFixed(2),
        balanceDue: balance.toFixed(2),
        status,
        updatedAt: new Date(),
      })
      .where(eq(supplierInvoices.id, inv.id))
      .returning();

    await journalPostingService.post({
      businessId: input.businessId,
      sourceType: "PAYMENT",
      sourceId: inv.id,
      description: `AP payment ${inv.invoiceNumber}`,
      reference: inv.invoiceNumber,
      postedBy: input.createdBy,
      lines: [
        {
          accountCode: "2000",
          debit: input.amount.toFixed(2),
          description: `Pay AP ${inv.invoiceNumber}`,
        },
        {
          accountCode: "1000",
          credit: input.amount.toFixed(2),
          description: `Cash out ${inv.invoiceNumber}`,
        },
      ],
    });

    return updated;
  }

  /** Aging from true supplier invoices with balance due */
  async aging(businessId: string) {
    const rows = await this.list(businessId);
    const open = rows.filter((r) => Number(r.balanceDue) > 0.009);
    const now = Date.now();
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, older: 0 };

    const detail = open.map((r) => {
      const total = Number(r.balanceDue);
      const base = r.dueDate ?? r.invoiceDate;
      const days = base
        ? Math.floor((now - new Date(base).getTime()) / 86400000)
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
        invoiceNumber: r.invoiceNumber,
        supplierName: r.supplierName ?? "—",
        status: r.status,
        days,
        balanceDue: total,
        currency: r.currency,
      };
    });

    return { buckets, detail };
  }
}

export const supplierInvoiceService = new SupplierInvoiceService();
