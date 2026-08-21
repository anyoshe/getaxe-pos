"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productBatchRepository } from "@/repositories/inventory/product-batches.repository";
import { inventoryService } from "../services/inventory.service";

const schema = z.object({
  batchId: z.uuid(),
  warehouseId: z.uuid(),
  quantity: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "Quantity cannot be zero"),
  notes: z.string().trim().nullable().optional(),
  reference: z.string().trim().nullable().optional(),
});

export async function adjustStockAction(input: unknown) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Check the form and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const batch = await productBatchRepository.findById(
    data.batchId,
    user.businessId,
  );

  if (!batch) {
    return { success: false as const, message: "Batch not found." };
  }

  try {
    await inventoryService.adjustStock({
      batchId: data.batchId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      movement: {
        businessId: user.businessId,
        productId: batch.productId,
        warehouseId: data.warehouseId,
        userId: user.id,
        movementType: "ADJUSTMENT",
        quantity: data.quantity,
        reference: data.reference ?? null,
        notes: data.notes ?? null,
      },
    });

    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/adjustments");
    revalidatePath("/inventory/batches");

    return {
      success: true as const,
      message: `Stock adjusted by ${data.quantity}.`,
    };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Adjustment failed.",
    };
  }
}
