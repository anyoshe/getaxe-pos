"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { updateWarehouseSchema } from "../schemas/warehouse";
import { warehousesService } from "../services/warehouses.service";

export async function updateWarehouseAction(
  id: string,
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
    updateWarehouseSchema.safeParse({
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
  await warehousesService.updateWarehouse(
    id,
    user.businessId,
    parsed.data
  );

  revalidatePath("/settings/warehouses");

  return {
    success: true,
    message: "Warehouse updated successfully.",
  };

} catch (error) {

  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "Failed to update warehouse.",
  };
}
}

