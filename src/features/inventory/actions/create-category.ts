"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createCategorySchema,
} from "../schemas";

import {
  categoryService,
} from "../services";

export async function createCategoryAction(
  formData: FormData
) {
  const user =
    await requireAuthorizedUser(
      "categories.create"
    );

  const parsed =
    createCategorySchema.safeParse({
      businessId: user.businessId,

      name: formData.get("name"),

      description:
        formData.get("description") ||
        null,

      active: true,
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
    await categoryService.createCategory(
      parsed.data
    );

    revalidatePath(
      "/inventory/categories"
    );

    return {
      success: true,
      message:
        "Category created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create category.",
    };
  }
}