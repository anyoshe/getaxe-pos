"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/permissions";

import { updateCategorySchema } from "../schemas/categories";
import { categoryService } from "../services";

function dbErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/markup_percent|last_purchase_cost|price_locked|column .* does not exist/i.test(msg)) {
    return "Database is missing pricing columns. Run migration 0036_product_costing_markup on production (Neon SQL), then try again.";
  }
  return msg || "Failed to update category.";
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    return { success: false as const, message: "Unauthorized" };
  }

  try {
    await requirePermission("categories.update");
  } catch {
    return {
      success: false as const,
      message: "You do not have permission to update Categories.",
    };
  }

  const rawMarkup = formData.get("markupPercent");
  const parsed = updateCategorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    markupPercent:
      rawMarkup === "" || rawMarkup == null ? null : String(rawMarkup),
    active: formData.get("active") === "true",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first =
      Object.values(flat)
        .flat()
        .find(Boolean) ?? "Check the form fields and try again.";
    return {
      success: false as const,
      message: String(first),
      errors: flat,
    };
  }

  try {
    const payload = {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      active: parsed.data.active,
      markupPercent:
        parsed.data.markupPercent == null
          ? null
          : String(parsed.data.markupPercent),
    };

    await categoryService.updateCategory(id, payload);

    revalidatePath("/inventory/categories");
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/product-prices");

    return {
      success: true as const,
      message: "Category updated successfully.",
    };
  } catch (error) {
    return {
      success: false as const,
      message: dbErrorMessage(error),
    };
  }
}
