"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productPriceService,
} from "../services";

export async function deleteProductPriceAction(
  id: string
) {
  const user =
    await requireAuthorizedUser(
      "product-prices.delete"
    );

  try {
    await productPriceService.deleteProductPrice(
      id,
      user.businessId
    );

    revalidatePath(
      "/inventory/product-prices"
    );

    return {
      success: true,
      message:
        "Product price archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive product price.",
    };
  }
}