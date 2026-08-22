"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productRepository } from "@/repositories/inventory/products.repository";
import { salesService } from "../services";
import { saleRepository } from "@/repositories/sales/sales.repository";
import { salesQueryService } from "../services/sales-query.service";

const lineSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().min(0),
});

const schema = z.object({
  documentType: z.enum(["quotation", "order"]),
  warehouseId: z.uuid(),
  branchId: z.uuid(),
  customerId: z.uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(lineSchema).min(1),
});

/**
 * Create quotation (QUO-*) or sales order (SO-*) as DRAFT — no stock deduction.
 */
export async function createSalesDocumentAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Add at least one product and check the form.",
    };
  }

  const data = parsed.data;
  const prefix = data.documentType === "quotation" ? "QUO" : "SO";
  const docLabel =
    data.documentType === "quotation" ? "Quotation" : "Sales order";

  try {
    const lines = [];
    for (const line of data.items) {
      const product = await productRepository.findById(
        line.productId,
        user.businessId,
      );
      if (!product) {
        return {
          success: false as const,
          message: `Product not found.`,
        };
      }
      const lineTotal = line.quantity * line.unitPrice;
      lines.push({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice.toFixed(2),
        discount: "0",
        tax: "0",
        total: lineTotal.toFixed(2),
        skipStock: true,
        serialNumbers: [] as string[],
      });
    }

    const subtotal = lines.reduce((s, l) => s + Number(l.total), 0);
    const invoiceNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

    const notePrefix =
      data.documentType === "quotation" ? "[QUOTATION]" : "[SALES_ORDER]";
    const notes = [notePrefix, data.notes].filter(Boolean).join(" ");

    const result = await salesService.createSale({
      sale: {
        businessId: user.businessId,
        branchId: data.branchId,
        warehouseId: data.warehouseId,
        customerId: data.customerId ?? null,
        invoiceNumber,
        status: "DRAFT",
        subtotal: subtotal.toFixed(2),
        discount: "0",
        tax: "0",
        total: subtotal.toFixed(2),
        amountPaid: "0",
        balanceDue: subtotal.toFixed(2),
        paymentStatus: "PENDING",
        notes,
        soldBy: user.id,
      },
      items: lines.map((l) => ({
        businessId: user.businessId,
        productId: l.productId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discount: l.discount,
        tax: l.tax,
        total: l.total,
        skipStock: true,
        serialNumbers: [],
      })),
      payments: [],
    });

    revalidatePath("/sales/quotations");
    revalidatePath("/sales/orders");

    return {
      success: true as const,
      message: `${docLabel} ${result.sale.invoiceNumber} saved.`,
      id: result.sale.id,
      invoiceNumber: result.sale.invoiceNumber,
      documentType: data.documentType,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : `Failed to save ${docLabel}.`,
    };
  }
}

/**
 * Convert a DRAFT quotation/order into a completed sale (deducts stock).
 */
export async function convertDocumentToSaleAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = z
    .object({
      saleId: z.uuid(),
      paymentMethod: z
        .enum(["CASH", "MPESA", "CARD", "MOBILE_MONEY", "CREDIT"])
        .default("CASH"),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid document." };
  }

  const detail = await salesQueryService.getSaleDetail(
    user.businessId,
    parsed.data.saleId,
  );

  if (!detail || detail.sale.status !== "DRAFT") {
    return {
      success: false as const,
      message: "Only draft quotations/orders can be converted.",
    };
  }

  try {
    const { createSaleAction } = await import("./create-sale");
    const result = await createSaleAction({
      warehouseId: detail.sale.warehouseId,
      branchId: detail.sale.branchId,
      customerId: detail.sale.customerId,
      notes: `Converted from ${detail.sale.invoiceNumber}`,
      paymentMethod: parsed.data.paymentMethod,
      items: detail.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        serialNumbers: [],
      })),
    });

    if (!result.success) return result;

    // Mark original draft as voided
    await saleRepository.update(detail.sale.id, {
      status: "VOIDED",
      notes: `${detail.sale.notes ?? ""} → converted to ${result.invoiceNumber}`,
    });

    revalidatePath("/sales/quotations");
    revalidatePath("/sales/orders");
    revalidatePath("/sales/invoices");

    return {
      success: true as const,
      message: `Converted to sale ${result.invoiceNumber}.`,
      saleId: result.saleId,
      invoiceNumber: result.invoiceNumber,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Conversion failed.",
    };
  }
}
