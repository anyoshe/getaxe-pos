"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { saleVoidService } from "../services";
import type { VoidSaleRequest } from "../types";

export async function voidSale(request: VoidSaleRequest) {
  await requireAuthorizedUser("sales.void");

  return saleVoidService.voidSaleTransaction(request);
}