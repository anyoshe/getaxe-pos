"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { purchaseOrderService } from "../services";
import type { CreatePurchaseOrderRequest } from "../types";

export async function createPurchaseOrder(request: CreatePurchaseOrderRequest) {
  await requireAuthorizedUser("purchase_orders.create");

  return purchaseOrderService.createPurchaseOrder(request);
}
