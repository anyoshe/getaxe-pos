"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { createCategorySchema } from "../schemas/categories";
import { categoryService } from "../services";

function dbErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/markup_percent|last_purchase_cost|price_locked|column .* does not exist/i.test(msg)) {
    return "Database is missing pricing columns. Run migration 0036_product_costing_markup on production (Neon SQL), then try again.";
  }
  return msg || "Failed to create category.";
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireAuthorizedUser("categories.create");

  const rawMarkup = formData.get("markupPercent");
  const parsed = createCategorySchema.safeParse({
    businessId: user.businessId,
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
    await categoryService.createCategory({
      businessId: parsed.data.businessId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      active: parsed.data.active,
      markupPercent:
        parsed.data.markupPercent == null
          ? null
          : String(parsed.data.markupPercent),
    });

    revalidatePath("/inventory/categories");

    return {
      success: true as const,
      message: "Category created successfully.",
    };
  } catch (error) {
    return {
      success: false as const,
      message: dbErrorMessage(error),
    };
  }
}
