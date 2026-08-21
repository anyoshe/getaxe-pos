"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  priceListService,
} from "../services";

export async function getPriceLists() {
  const user =
    await requireAuthorizedUser(
      "price_lists.view"
    );

  return priceListService.getPriceLists(
    user.businessId
  );
}

export async function getPriceList(
  id: string
) {
  const user =
    await requireAuthorizedUser(
      "price_lists.view"
    );

  return priceListService.getPriceList(
    id,
    user.businessId
  );
}
