"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/permissions";

import { updateCategorySchema } from "../schemas/categories";
import { categoryService } from "../services";
import { ensureProductCostingSchema } from "../services/ensure-product-costing-schema";

function dbErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    /markup_percent|last_purchase_cost|price_locked|column .* does not exist/i.test(
      msg,
    )
  ) {
    return "Database is missing pricing columns. Open Categories once (auto-migrate) or run migration 0036 on Neon, then try again.";
  }
  if (/permission|categories\.update/i.test(msg)) {
    return "You do not have permission to update Categories.";
  }
  return msg || "Failed to update category.";
}

function formStr(v: FormDataEntryValue | null): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return "";
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

  // Ensure DB columns exist (self-heal production if 0036 never ran)
  try {
    await ensureProductCostingSchema();
  } catch (error) {
    return {
      success: false as const,
      message: dbErrorMessage(error),
    };
  }

  const rawMarkup = formStr(formData.get("markupPercent"));
  const rawDesc = formStr(formData.get("description"));
  const parsed = updateCategorySchema.safeParse({
    name: formStr(formData.get("name")),
    description: rawDesc.trim() === "" ? null : rawDesc,
    markupPercent: rawMarkup.trim() === "" ? null : rawMarkup,
    active: formStr(formData.get("active")) === "true",
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
    await categoryService.updateCategory(id, {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      active: parsed.data.active,
      markupPercent:
        parsed.data.markupPercent == null
          ? null
          : String(parsed.data.markupPercent),
    });

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
