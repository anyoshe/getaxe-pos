"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { customers } from "@/db/schema/sales/customers";
import { sales } from "@/db/schema/sales/sales";
import { journalPostingService } from "@/features/finance/services/journal-posting.service";
import { financeService } from "@/features/finance/services/finance.service";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { formatDateTimeNairobi } from "@/lib/timezone";
import { paymentService } from "../services/payment.service";

const schema = z.object({
  saleId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  method: z.enum(["CASH", "MPESA", "CARD", "MOBILE_MONEY", "BANK_TRANSFER", "CHEQUE"]).default("CASH"),
  reference: z.string().trim().optional().nullable(),
});

export async function listOpenCreditInvoicesAction() {
  const user = await requireAuthorizedUser("sales.view");
  const rows = await db
    .select({
      id: sales.id,
      invoiceNumber: sales.invoiceNumber,
      soldAt: sales.soldAt,
      total: sales.total,
      amountPaid: sales.amountPaid,
      balanceDue: sales.balanceDue,
      paymentStatus: sales.paymentStatus,
      customerId: sales.customerId,
      companyName: customers.companyName,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      customerType: customers.customerType,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(
      and(
        eq(sales.businessId, user.businessId),
        sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
        sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
      ),
    )
    .orderBy(desc(sales.soldAt))
    .limit(200);

  return {
    success: true as const,
    invoices: rows.map((r) => {
      const isBiz = r.customerType === "BUSINESS";
      const person = [r.firstName, r.lastName].filter(Boolean).join(" ");
      const customerName = isBiz
        ? r.companyName || person || "Customer"
        : person || r.companyName || "Customer";
      return {
        id: r.id,
        invoiceNumber: r.invoiceNumber,
        soldAt: r.soldAt ? formatDateTimeNairobi(r.soldAt) : "—",
        total: Number(r.total ?? 0),
        amountPaid: Number(r.amountPaid ?? 0),
        balanceDue: Number(r.balanceDue ?? 0),
        paymentStatus: r.paymentStatus,
        customerId: r.customerId,
        customerName,
        contactName: isBiz ? person || null : null,
        phone: r.phone,
      };
    }),
  };
}

export async function listCustomerArBalancesAction() {
  const user = await requireAuthorizedUser("sales.view");
  const rows = await db
    .select({
      customerId: sales.customerId,
      companyName: customers.companyName,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      customerType: customers.customerType,
      creditLimit: customers.creditLimit,
      openInvoices: sql<number>`count(${sales.id})::int`,
      balance: sql<string>`coalesce(sum(${sales.balanceDue}::numeric), 0)`,
      totalInvoiced: sql<string>`coalesce(sum(${sales.total}::numeric), 0)`,
      totalPaid: sql<string>`coalesce(sum(${sales.amountPaid}::numeric), 0)`,
    })
    .from(sales)
    .innerJoin(customers, eq(sales.customerId, customers.id))
    .where(
      and(
        eq(sales.businessId, user.businessId),
        sql`${sales.paymentStatus} in ('PENDING','PARTIAL')`,
        sql`coalesce(${sales.balanceDue}::numeric, 0) > 0`,
      ),
    )
    .groupBy(
      sales.customerId,
      customers.companyName,
      customers.firstName,
      customers.lastName,
      customers.phone,
      customers.customerType,
      customers.creditLimit,
    )
    .orderBy(sql`sum(${sales.balanceDue}::numeric) desc`);

  return {
    success: true as const,
    accounts: rows.map((r) => {
      const isBiz = r.customerType === "BUSINESS";
      const person = [r.firstName, r.lastName].filter(Boolean).join(" ");
      return {
        customerId: r.customerId!,
        customerName: isBiz
          ? r.companyName || person || "Customer"
          : person || r.companyName || "Customer",
        phone: r.phone,
        creditLimit: Number(r.creditLimit ?? 0),
        openInvoices: Number(r.openInvoices ?? 0),
        balance: Number(r.balance ?? 0),
        totalInvoiced: Number(r.totalInvoiced ?? 0),
        totalPaid: Number(r.totalPaid ?? 0),
      };
    }),
  };
}

export async function receiveCreditPaymentAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.flatten().formErrors[0] || "Invalid payment.",
    };
  }

  const { saleId, amount, method, reference } = parsed.data;

  const [sale] = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, saleId), eq(sales.businessId, user.businessId)))
    .limit(1);

  if (!sale) {
    return { success: false as const, message: "Invoice not found." };
  }

  const balance = Number(sale.balanceDue ?? 0);
  if (balance <= 0.001) {
    return { success: false as const, message: "This invoice is already fully paid." };
  }
  if (amount > balance + 0.01) {
    return {
      success: false as const,
      message: `Amount exceeds balance due (KES ${balance.toLocaleString()}).`,
    };
  }

  try {
    const tillAccountId = await financeService
      .resolveCashAccountIdForMethod(user.businessId, method)
      .catch(() => null);

    const result = await paymentService.recordPayment({
      saleId,
      payments: [
        {
          businessId: user.businessId,
          saleId,
          method: method as any,
          status: "COMPLETED",
          amount: amount.toFixed(2),
          receivedBy: user.id,
          cashAccountId: tillAccountId,
          transactionReference: reference || null,
        } as any,
      ],
    });

    const payment = result.payments[0];
    try {
      await journalPostingService.postArCollection({
        businessId: user.businessId,
        saleId,
        paymentId: payment?.id,
        invoiceNumber: String(sale.invoiceNumber),
        amount,
        postedBy: user.id,
      });
    } catch (e) {
      console.error("[receive-credit-payment] journal", e);
    }

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "CREATE",
      entity: "PAYMENT",
      entityId: payment?.id,
      description: `AR payment ${amount} on ${sale.invoiceNumber} via ${method}`,
    });

    revalidatePath("/sales/receivables");
    revalidatePath("/sales/invoices");
    revalidatePath("/finance/payments");
    revalidatePath("/reports");

    const updated = result.sale;
    return {
      success: true as const,
      message: `Payment of KES ${amount.toLocaleString()} recorded on ${sale.invoiceNumber}.`,
      payment: {
        id: payment?.id,
        amount,
        method,
        reference: reference || null,
        paidAt: formatDateTimeNairobi(new Date()),
      },
      invoice: {
        id: sale.id,
        invoiceNumber: String(sale.invoiceNumber),
        total: Number(sale.total ?? 0),
        amountPaid: Number(updated?.amountPaid ?? 0),
        balanceDue: Number(updated?.balanceDue ?? 0),
        paymentStatus: updated?.paymentStatus ?? "PARTIAL",
      },
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to record payment.",
    };
  }
}
