"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { saleReturnService } from "../services";
import type { CreateSaleReturnRequest } from "../types";

export async function createSaleReturn(request: CreateSaleReturnRequest) {
  await requireAuthorizedUser("sales.returns.create");

  return saleReturnService.createSaleReturn(request);
}
