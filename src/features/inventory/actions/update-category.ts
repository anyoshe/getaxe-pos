"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/permissions";

import {
  updateCategorySchema,
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
    updateCategorySchema.safeParse({
      name:
        formData.get("name"),

      description:
        formData.get("description") || null,

      active:
        formData.get("active") === "true",
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