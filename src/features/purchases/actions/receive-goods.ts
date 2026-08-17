"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { goodsReceiptService } from "../services";
import type { ReceiveGoodsRequest } from "../types";

export async function receiveGoods(request: ReceiveGoodsRequest) {
  await requireAuthorizedUser("goods_receipts.create");

  return goodsReceiptService.receiveGoods(request);
}
