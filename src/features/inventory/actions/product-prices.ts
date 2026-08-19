"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productPriceService,
} from "../services";

export async function getProductPrices() {
  const user =
    await requireAuthorizedUser(
      "product-prices.view"
    );

  return productPriceService.getProductPrices(
    user.businessId
  );
}

export async function getProductPrice(
  id: string
) {
  const user =
    await requireAuthorizedUser(
      "product-prices.view"
    );

  return productPriceService.getProductPrice(
    id,
    user.businessId
  );
}