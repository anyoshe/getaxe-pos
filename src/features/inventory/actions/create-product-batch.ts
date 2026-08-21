"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createProductBatchSchema,
} from "../schemas";

import {
  productBatchService,
} from "../services";

export async function createProductBatchAction(
  formData: FormData
) {
  await requireAuthorizedUser(
    "product_batches.create"
  );

  const parsed =
    createProductBatchSchema.safeParse({
      businessId:
        formData.get("businessId"),

      productId:
        formData.get("productId"),

      supplierId:
        formData.get("supplierId") || null,

      batchNumber:
        formData.get("batchNumber"),

      manufactureDate:
        formData.get("manufactureDate") || null,

      expiryDate:
        formData.get("expiryDate") || null,

      purchaseInvoice:
        formData.get("purchaseInvoice") || null,

      costPrice:
        formData.get("costPrice"),

      sellingPrice:
        formData.get("sellingPrice")
          ? Number(formData.get("sellingPrice"))
          : null,

      quantityReceived:
        formData.get("quantityReceived"),

      quantityRemaining:
        formData.get("quantityRemaining"),

      active:
        formData.get("active") === "true",
    });

  if (!parsed.success) {
    return {
      success: false,
      errors:
        parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await productBatchService.createProductBatch({
      ...parsed.data,
      costPrice:
        parsed.data.costPrice.toString(),
      sellingPrice:
        parsed.data.sellingPrice?.toString() ??
        null,
    });

    revalidatePath(
      "/inventory/product-batches"
    );

    return {
      success: true,
      message:
        "Product batch created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create product batch.",
    };
  }
}