"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { supplierReturnService } from "../services";
import type { PostSupplierReturnRequest } from "../types";

export async function postSupplierReturn(request: PostSupplierReturnRequest) {
  await requireAuthorizedUser("supplier_returns.post");

  return supplierReturnService.post(request);
}
