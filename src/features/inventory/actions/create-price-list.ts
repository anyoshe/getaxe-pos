"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { createPriceListSchema } from "../schemas";

import { priceListService } from "../services";

export async function createPriceListAction(formData: FormData) {
  const user =
  await requireAuthorizedUser(
    "price_lists.create"
  );

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
      true,
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await priceListService.createPriceList(parsed.data);

    revalidatePath("/inventory/price-lists");

    return {
      success: true,
      message: "Price list created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create price list.",
    };
  }
}
