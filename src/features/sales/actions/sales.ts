"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { salesQueryService } from "../services";

export async function getSales(businessId: string) {
  await requireAuthorizedUser("sales.view");
  return salesQueryService.getSales(businessId);
}

export async function getSale(saleId: string) {
  await requireAuthorizedUser("sales.view");
  return salesQueryService.getSale(saleId);
}
