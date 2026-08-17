"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { salesService } from "../services";
import type { CreateSaleRequest } from "../types";

export async function createSale(request: CreateSaleRequest) {
  await requireAuthorizedUser("sales.create");

  return salesService.createSale(request);
}