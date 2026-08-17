"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { purchaseOrderService } from "../services";

export async function cancelPurchaseOrder(purchaseOrderId: string) {
  await requireAuthorizedUser("purchase_orders.cancel");

  return purchaseOrderService.cancelPurchaseOrder(purchaseOrderId);
}
