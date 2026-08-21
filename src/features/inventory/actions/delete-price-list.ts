"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  priceListService,
} from "../services";

export async function deletePriceListAction(
  id: string
) {
  const user =
    await requireAuthorizedUser(
      "price_lists.delete"
    );

  try {
    await priceListService.deletePriceList(
      id,
      user.businessId
    );

    revalidatePath(
      "/inventory/price-lists"
    );

    return {
      success: true,
      message:
        "Price list archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive price list.",
    };
  }
}
