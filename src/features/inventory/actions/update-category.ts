"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/permissions";

import {
  createCategorySchema,
} from "../schemas/categories";

import {
  categoryService,
} from "../services";


export async function updateCategoryAction(
  id: string,
  formData: FormData
) {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    await requirePermission(
      "categories.update"
    );
  } catch {
    return {
      success: false,
      message:
        "You do not have permission to update Categories.",
    };
  }

  const parsed =
    createCategorySchema.safeParse({

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

      categoryBrand:
        formData.get("categoryBrand") || null,

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
    await categoryService.updateCategory(
      id,
      parsed.data
    );

    revalidatePath(
      "/inventory/categories"
    );

    return {
      success: true,
      message:
        "Category updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update category.",
    };
  }
}