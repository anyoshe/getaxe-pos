import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  purchaseOrders,
} from "@/db/schema/purchasing/purchase_orders";

import {
  purchaseOrderItems,
} from "@/db/schema/purchasing/purchase_order_items";


export type PurchaseOrderInsert =
  InferInsertModel<
    typeof purchaseOrders
  >;


export type PurchaseOrderItemInsert =
  InferInsertModel<
    typeof purchaseOrderItems
  >;



export interface CreatePurchaseOrderRequest {

  order: PurchaseOrderInsert;

  items: PurchaseOrderItemInsert[];

}



export interface ApprovePurchaseOrderRequest {

  purchaseOrderId: string;

  approvedBy: string;

}