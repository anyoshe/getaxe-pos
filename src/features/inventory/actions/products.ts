"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import { productService } from "../services";

export async function getProducts() {
  const user =
    await requireAuthorizedUser(
        "products.view"
    );

  return productService.getProducts(
    user.businessId
  );
}

export async function getProduct(
  id: string
) {
  const user =
    await requireAuthorizedUser(
        "products.view"
    );

  return productService.getProduct(
  id,
  user.businessId
);
}