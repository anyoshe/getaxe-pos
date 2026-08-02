"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  createProductPriceSchema,
} from "../schemas";

import {
  productPriceService,
} from "../services";

export async function createProductPriceAction(
  formData: FormData
) {
  await requireAuthorizedUser(
    "product-prices.create"
  );

  const parsed =
    createProductPriceSchema.safeParse({
      businessId:
        formData.get("businessId"),

      productId:
        formData.get("productId"),

      priceListId:
        formData.get("priceListId"),

      price:
        formData.get("price"),

      minimumQuantity:
        formData.get("minimumQuantity") ?? "1",

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
    await productPriceService.createProductPrice({
      ...parsed.data,
      price: parsed.data.price.toString(),
      minimumQuantity:
        parsed.data.minimumQuantity.toString(),
    });

    revalidatePath(
      "/inventory/product-prices"
    );

    return {
      success: true,
      message:
        "Product price created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create product price.",
    };
  }
}