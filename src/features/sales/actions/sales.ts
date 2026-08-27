"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { salesQueryService } from "../services";

export async function getSales(businessId: string) {
  await requireAuthorizedUser("sales.view");
  return salesQueryService.listSales(businessId);
}

export async function getSale(saleId: string) {
  const user = await requireAuthorizedUser("sales.view");
  return salesQueryService.getSaleDetail(user.businessId, saleId);
}
