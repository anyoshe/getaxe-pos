"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { supplierService } from "../services";

export async function deleteSupplierAction(id: string) {
  await requireAuthorizedUser("suppliers.delete");

  try {
    const user = await requireAuthorizedUser("suppliers.delete");

    await supplierService.deleteSupplier(id, user.businessId);

    revalidatePath("/inventory/suppliers");

    return {
      success: true,
      message: "Supplier archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to archive supplier.",
    };
  }
}
