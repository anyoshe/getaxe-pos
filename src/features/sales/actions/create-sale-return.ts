"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { saleReturnService } from "../services";
import { salesQueryService } from "../services/sales-query.service";

const schema = z.object({
  saleId: z.uuid(),
  reason: z
    .enum([
      "DAMAGED",
      "DEFECTIVE",
      "EXPIRED",
      "WRONG_ITEM",
      "CUSTOMER_CHANGED_MIND",
      "PRICE_ADJUSTMENT",
      "OTHER",
    ])
    .default("OTHER"),
  items: z
    .array(
      z.object({
        saleItemId: z.uuid(),
        productId: z.uuid(),
        quantity: z.coerce.number().int().positive(),
        unitPrice: z.coerce.number().min(0),
        productBatchId: z.uuid().nullable().optional(),
        warehouseId: z.uuid(),
      }),
    )
    .min(1),
});

export async function createSaleReturnAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.void");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the return form.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const detail = await salesQueryService.getSaleDetail(
    user.businessId,
    data.saleId,
  );

  if (!detail) {
    return { success: false as const, message: "Sale not found." };
  }

  const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}`;
  const lines = data.items.map((item) => {
    const total = item.quantity * item.unitPrice;
    // Prefer batch from sale allocation
    const batch =
      item.productBatchId ??
      detail.batches.find((b) => b.saleItemId === item.saleItemId)
        ?.productBatchId ??
      null;

    return {
      ...item,
      productBatchId: batch,
      total,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  try {
    // Items without batch cannot restock via current service — require batch
    for (const line of lines) {
      if (!line.productBatchId) {
        return {
          success: false as const,
          message:
            "Cannot return a line without batch allocation. Stock may not have been deducted for that item.",
        };
      }
    }

    await saleReturnService.createSaleReturn({
      saleReturn: {
        businessId: user.businessId,
        saleId: data.saleId,
        customerId: detail.sale.customerId,
        returnNumber,
        reason: data.reason,
        subtotal: subtotal.toFixed(2),
        tax: "0",
        total: subtotal.toFixed(2),
        createdBy: user.id,
      },
      items: lines.map((l) => ({
        saleItemId: l.saleItemId,
        productBatchId: l.productBatchId!,
        productId: l.productId,
        warehouseId: l.warehouseId,
        quantity: l.quantity,
        unitPrice: l.unitPrice.toFixed(2),
        total: l.total.toFixed(2),
      })),
    });

    revalidatePath("/sales/returns");
    revalidatePath("/sales/invoices");
    revalidatePath("/inventory/stock");

    return {
      success: true as const,
      message: `Return ${returnNumber} recorded.`,
      returnNumber,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to create return.",
    };
  }
}
