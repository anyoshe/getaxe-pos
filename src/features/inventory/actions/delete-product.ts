"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productService,
} from "../services";


export async function deleteProductAction(
  id: string
) {
  await requireAuthorizedUser(
    "products.delete"
);
  try {
    await productService.deleteProduct(
      id
    );

    revalidatePath(
      "/inventory/products"
    );

    return {
      success: true,
      message:
        "Product archived successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to archive product.",
    };
  }
}