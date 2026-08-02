"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  priceListService,
} from "../services";

export async function deletePriceListAction(
  id: string
) {
  await requireAuthorizedUser(
    "price-lists.delete"
  );

  try {
    await priceListService.deletePriceList(
      id
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