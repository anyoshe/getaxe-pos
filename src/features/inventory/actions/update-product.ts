"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createProductSchema,
} from "../schemas/products";

import {
  productService,
} from "../services";


export async function updateProductAction(
  id: string,
  formData: FormData
) {
  const user =
    await requireAuthorizedUser(
        "products.update"
    );

  const parsed =
    createProductSchema.safeParse({

      categoryId:
        formData.get("categoryId"),

      supplierId:
        formData.get("supplierId") || null,

      manufacturerId:
        formData.get("manufacturerId") || null,

      name:
        formData.get("name"),

      genericName:
        formData.get("genericName") || null,

      productBrand:
        formData.get("productBrand") || null,

      description:
        formData.get("description") || null,

      sku:
        formData.get("sku") || null,

      barcode:
        formData.get("barcode") || null,

      packSize:
        formData.get("packSize") || null,

      costPrice:
        formData.get("costPrice") || null,

      trackInventory:
        formData.get("trackInventory") === "true",

      trackBatch:
        formData.get("trackBatch") === "true",

      trackExpiry:
        formData.get("trackExpiry") === "true",

      serialized:
        formData.get("serialized") === "true",

      allowNegativeStock:
        formData.get("allowNegativeStock") === "true",

      minimumStock:
        Number(
          formData.get("minimumStock") ?? 0
        ),

      reorderLevel:
        Number(
          formData.get("reorderLevel") ?? 0
        ),
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
    await productService.updateProduct(
      id,
      parsed.data
    );

    revalidatePath(
      "/inventory/products"
    );

    return {
      success: true,
      message:
        "Product updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product.",
    };
  }
}