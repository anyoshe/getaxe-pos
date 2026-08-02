"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productPriceService,
} from "../services";

export async function getProductPrices(
  businessId: string
) {
  await requireAuthorizedUser(
    "product-prices.view"
  );

  return productPriceService.getProductPrices(
    businessId
  );
}

export async function getProductPrice(
  id: string
) {
  await requireAuthorizedUser(
    "product-prices.view"
  );

  return productPriceService.getProductPrice(
    id
  );
}