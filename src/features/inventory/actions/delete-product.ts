"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { productService } from "../services";

export async function deleteProductAction(id: string) {

  try {
    const user =
      await requireAuthorizedUser(
        "products.delete"
      );

    await productService.deleteProduct(
      id,
      user.businessId
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