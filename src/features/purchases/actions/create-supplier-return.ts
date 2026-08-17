"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { supplierReturnService } from "../services";
import type { CreateSupplierReturnRequest } from "../types";

export async function createSupplierReturn(request: CreateSupplierReturnRequest) {
  await requireAuthorizedUser("supplier_returns.create");

  return supplierReturnService.create(request);
}
