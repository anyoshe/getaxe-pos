import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  goodsReceipts,
} from "@/db/schema/purchasing/goods_receipts";

import {
  goodsReceiptItems,
} from "@/db/schema/purchasing/goods_receipt_items";


export type GoodsReceiptInsert =
  InferInsertModel<
    typeof goodsReceipts
  >;


export type GoodsReceiptItemInsert =
  InferInsertModel<
    typeof goodsReceiptItems
  >;

export type ReceiveGoodsItem = GoodsReceiptItemInsert & {
  serialNumbers?: string[];
};



export interface ReceiveGoodsRequest {

  receipt: GoodsReceiptInsert;

  items: ReceiveGoodsItem[];

  warehouseId: string;

}



export interface PostGoodsReceiptRequest {

  goodsReceiptId: string;

}