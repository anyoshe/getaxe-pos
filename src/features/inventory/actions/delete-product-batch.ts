"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productBatchService,
} from "../services";

export async function deleteProductBatchAction(
  id: string
) {
  try {
    const user =
      await requireAuthorizedUser(
        "product-batches.delete"
      );

    await productBatchService.deleteProductBatch(
      id,
      user.businessId
    );

    revalidatePath(
      "/inventory/product-batches"
    );

    return {
      success: true,
      message:
        "Product batch archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive product batch.",
    };
  }
}