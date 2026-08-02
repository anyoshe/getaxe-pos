"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/permissions";

import {
  categoryService,
} from "../services";


export async function deleteCategoryAction(
  id: string
) {
  try {
    await requirePermission(
      "categories.delete"
    );
  } catch {
    return {
      success: false,
      message:
        "You do not have permission to delete categories.",
    };
  }

  try {
    await categoryService.deleteCategory(
      id
    );

    revalidatePath(
      "/inventory/categories"
    );

    return {
      success: true,
      message:
        "Category archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive category.",
    };
  }
}