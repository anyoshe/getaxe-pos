"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { purchaseOrderService } from "../services";
import type { ApprovePurchaseOrderRequest } from "../types";

export async function approvePurchaseOrder(request: ApprovePurchaseOrderRequest) {
  await requireAuthorizedUser("purchase_orders.approve");

  return purchaseOrderService.approvePurchaseOrder(request);
}
