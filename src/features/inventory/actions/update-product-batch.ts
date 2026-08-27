import { qtyStr } from "@/lib/quantity";
"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createProductBatchSchema,
} from "../schemas";

import {
  productBatchService,
} from "../services";

export async function updateProductBatchAction(
  id: string,
  formData: FormData
) {
  try {
    const user =
      await requireAuthorizedUser(
        "product_batches.update"
      );

    const parsed =
      createProductBatchSchema.safeParse({
        businessId:
          user.businessId,

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

    await productBatchService.updateProductBatch(
      id,
      user.businessId,
      {
        ...parsed.data,
      quantityReceived: qtyStr(parsed.data.quantityReceived),
      quantityRemaining: qtyStr(
        (parsed.data as { quantityRemaining?: number }).quantityRemaining ??
          parsed.data.quantityReceived,
      ),

        costPrice:
          parsed.data.costPrice.toString(),

        sellingPrice:
          parsed.data.sellingPrice?.toString() ??
          null,
      }
    );

    revalidatePath(
      "/inventory/product-batches"
    );

    return {
      success: true,
      message:
        "Product batch updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product batch.",
    };
  }
}