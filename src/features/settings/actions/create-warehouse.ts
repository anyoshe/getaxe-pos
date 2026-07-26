"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { createWarehouseSchema } from "../schemas/warehouse";
import { warehousesService } from "../services/warehouses.service";

export async function createWarehouseAction(
  formData: FormData
) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const parsed =
    createWarehouseSchema.safeParse({
      businessId: user.businessId,

      branchId: formData.get("branchId"),

      code: formData.get("code"),

      name: formData.get("name"),

      description:
        formData.get("description") ||
        null,

      active: true,
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
  await warehousesService.createWarehouse(
    parsed.data
  );

  revalidatePath("/settings/warehouses");

  return {
    success: true,
    message: "Warehouse created successfully.",
  };
} catch (error) {
  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Failed to create warehouse.",
  };
}
}