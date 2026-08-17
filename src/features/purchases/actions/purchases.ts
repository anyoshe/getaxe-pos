"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { purchasesQueryService } from "../services";

export async function getPurchaseOrders(businessId: string) {
  await requireAuthorizedUser("purchase_orders.view");
  return purchasesQueryService.getPurchaseOrders(businessId);
}

export async function getPurchaseOrder(purchaseOrderId: string) {
  await requireAuthorizedUser("purchase_orders.view");
  return purchasesQueryService.getPurchaseOrder(purchaseOrderId);
}

export async function getGoodsReceipts(businessId: string) {
  await requireAuthorizedUser("goods_receipts.view");
  return purchasesQueryService.getGoodsReceipts(businessId);
}

export async function getGoodsReceipt(goodsReceiptId: string) {
  await requireAuthorizedUser("goods_receipts.view");
  return purchasesQueryService.getGoodsReceipt(goodsReceiptId);
}

export async function getSupplierReturns(businessId: string) {
  await requireAuthorizedUser("supplier_returns.view");
  return purchasesQueryService.getSupplierReturns(businessId);
}

export async function getSupplierReturn(supplierReturnId: string) {
  await requireAuthorizedUser("supplier_returns.view");
  return purchasesQueryService.getSupplierReturn(supplierReturnId);
}
