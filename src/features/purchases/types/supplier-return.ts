import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  supplierReturns,
} from "@/db/schema/purchasing/supplier_returns";

import {
  supplierReturnItems,
} from "@/db/schema/purchasing/supplier_return_items";


export type SupplierReturnInsert =
  InferInsertModel<
    typeof supplierReturns
  >;


export type SupplierReturnItemInsert =
  InferInsertModel<
    typeof supplierReturnItems
  >;



export interface CreateSupplierReturnItemRequest
  extends SupplierReturnItemInsert {

  /**
   * Warehouse from which stock is removed.
   */
  warehouseId: string;
  serialNumbers?: string[];

}



export interface CreateSupplierReturnRequest {

  supplierReturn: SupplierReturnInsert;

  items: CreateSupplierReturnItemRequest[];

}



export interface PostSupplierReturnRequest {

  supplierReturnId: string;

}