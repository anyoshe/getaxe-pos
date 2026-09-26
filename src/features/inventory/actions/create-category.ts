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

      markupPercent:
        formData.get("markupPercent") === "" ||
        formData.get("markupPercent") == null
          ? null
          : Number(formData.get("markupPercent")),

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
    const payload = {
      ...parsed.data,
      markupPercent:
        parsed.data.markupPercent == null
          ? null
          : String(parsed.data.markupPercent),
    };
    await categoryService.createCategory(
      payload as typeof parsed.data & { markupPercent: string | null }
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