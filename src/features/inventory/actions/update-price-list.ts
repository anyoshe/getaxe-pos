"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { createPriceListSchema } from "../schemas";

import { priceListService } from "../services";

export async function updatePriceListAction(id: string, formData: FormData) {
  const user = await requireAuthorizedUser("price_lists.update");

  const parsed =
  createPriceListSchema.safeParse({
    businessId: user.businessId,

    code:
      formData.get("code"),

    name:
      formData.get("name"),

    description:
      formData.get("description") ||
      null,

    isDefault:
      formData.get("isDefault") === "true",

    active:
      formData.get("active") === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await priceListService.updatePriceList(id, parsed.data, user.businessId);
    revalidatePath("/inventory/price-lists");

    return {
      success: true,
      message: "Price list updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update price list.",
    };
  }
}
