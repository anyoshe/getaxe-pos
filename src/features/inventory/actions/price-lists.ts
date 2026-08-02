"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  priceListService,
} from "../services";

export async function getPriceLists(
  businessId: string
) {
  await requireAuthorizedUser(
    "price-lists.view"
  );

  return priceListService.getPriceLists(
    businessId
  );
}

export async function getPriceList(
  id: string
) {
  await requireAuthorizedUser(
    "price-lists.view"
  );

  return priceListService.getPriceList(
    id
  );
}