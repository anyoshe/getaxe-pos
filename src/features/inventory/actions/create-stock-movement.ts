"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createStockMovementSchema,
} from "../schemas";

import {
  stockMovementService,
} from "../services";

export async function createStockMovementAction(
  formData: FormData
) {
  await requireAuthorizedUser(
    "stock-movements.create"
  );

  const parsed =
    createStockMovementSchema.safeParse({
      businessId:
        formData.get("businessId"),

      productId:
        formData.get("productId"),

      batchId:
        formData.get("batchId") || null,

      warehouseId:
        formData.get("warehouseId"),

      userId:
        formData.get("userId") || null,

      movementType:
        formData.get("movementType"),

      quantity:
        formData.get("quantity"),

      unitCost:
        formData.get("unitCost")
          ? Number(formData.get("unitCost"))
          : null,

      reference:
        formData.get("reference") || null,

      notes:
        formData.get("notes") || null,
    });

  if (!parsed.success) {
    return {
      success: false,
      errors:
        parsed.error.flatten()
          .fieldErrors,
    };
  }

  try {
    await stockMovementService.createStockMovement({
      ...parsed.data,
      unitCost:
        parsed.data.unitCost?.toString() ??
        null,
    });

    revalidatePath(
      "/inventory/stock-movements"
    );

    return {
      success: true,
      message:
        "Stock movement recorded successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to record stock movement.",
    };
  }
}