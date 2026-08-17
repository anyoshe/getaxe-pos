"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { goodsReceiptService } from "../services";
import type { PostGoodsReceiptRequest } from "../types";

export async function postGoodsReceipt(request: PostGoodsReceiptRequest) {
  await requireAuthorizedUser("goods_receipts.post");

  return goodsReceiptService.postGoodsReceipt(request);
}
