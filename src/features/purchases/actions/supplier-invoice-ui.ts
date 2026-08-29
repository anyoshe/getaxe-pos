"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { supplierInvoiceService } from "../services/supplier-invoice.service";

export async function createSupplierInvoiceAction(input: unknown) {
  const user = await requireAuthorizedUser("purchase_orders.create");
  const parsed = z
    .object({
      supplierId: z.uuid(),
      purchaseOrderId: z.uuid().nullable().optional(),
      invoiceNumber: z.string().min(1),
      total: z.coerce.number().positive(),
      tax: z.coerce.number().min(0).optional(),
      dueDate: z.string().nullable().optional(),
      currency: z.string().min(3).optional(),
      notes: z.string().nullable().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Check invoice fields." };
  }

  try {
    await supplierInvoiceService.create({
      businessId: user.businessId,
      supplierId: parsed.data.supplierId,
      purchaseOrderId: parsed.data.purchaseOrderId,
      invoiceNumber: parsed.data.invoiceNumber,
      total: parsed.data.total,
      tax: parsed.data.tax,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      currency: parsed.data.currency,
      notes: parsed.data.notes,
      createdBy: user.id,
    });
    revalidatePath("/purchases/supplier-invoices");
    revalidatePath("/finance/ap-aging");
    return { success: true as const, message: "Supplier invoice recorded." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create invoice.",
    };
  }
}

export async function paySupplierInvoiceAction(input: unknown) {
  const user = await requireAuthorizedUser("purchase_orders.create");
  const parsed = z
    .object({
      invoiceId: z.uuid(),
      amount: z.coerce.number().positive(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid payment." };
  }

  try {
    await supplierInvoiceService.recordPayment({
      businessId: user.businessId,
      invoiceId: parsed.data.invoiceId,
      amount: parsed.data.amount,
      createdBy: user.id,
    });
    revalidatePath("/purchases/supplier-invoices");
    revalidatePath("/finance/ap-aging");
    return { success: true as const, message: "Payment recorded." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Payment failed.",
    };
  }
}
