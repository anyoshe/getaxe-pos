"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/permissions";

import { getCurrentUser } from "@/lib/auth/current-user";

import { createWarehouseSchema } from "../schemas/warehouse";
import { warehousesService } from "../services/warehouses.service";


export async function createWarehouseAction(
  formData: FormData
) {
  try {
    await requirePermission(
      "warehouses.create"
    );
  } catch {
    return {
      success: false,
      message:
        "You do not have permission to create warehouses.",
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }
  try {
   await requirePermission(
  "warehouses.create"
);
  } catch {
    return {
      success: false,
      message: "You do not have permission to create warehouses.",
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