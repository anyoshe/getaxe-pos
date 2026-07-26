"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";

import { warehousesService } from "../services/warehouses.service";

export async function deleteWarehouseAction(
  id: string
) {
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