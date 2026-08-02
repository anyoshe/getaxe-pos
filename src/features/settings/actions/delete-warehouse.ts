"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/permissions";

import { getCurrentUser } from "@/lib/auth/current-user";

import { warehousesService } from "../services/warehouses.service";

export async function deleteWarehouseAction(
  id: string
) {

   try {
        await requirePermission(
          "warehouses.delete"
        );
      } catch {
        return {
          success: false,
          message:
            "You do not have permission to delete warehouses.",
        };
      }

  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  await warehousesService.deleteWarehouse(
    id,
    user.businessId
  );

  revalidatePath(
    "/settings/warehouses"
  );

  return {
    success: true,
    message:
      "Warehouse deleted successfully.",
  };
}