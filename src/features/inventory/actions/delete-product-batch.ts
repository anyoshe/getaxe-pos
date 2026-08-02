"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productBatchService,
} from "../services";

export async function deleteProductBatchAction(
  id: string
) {
  await requireAuthorizedUser(
    "product-batches.delete"
  );

  try {
    await productBatchService.deleteProductBatch(
      id
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