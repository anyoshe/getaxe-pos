import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  saleReturns,
} from "@/db/schema/sales/sale_returns";

import {
  saleReturnItems,
} from "@/db/schema/sales/sale_return_items";

export type SaleReturnInsert =
  InferInsertModel<
    typeof saleReturns
  >;

export type SaleReturnItemInsert =
  InferInsertModel<
    typeof saleReturnItems
  >;

export interface CreateSaleReturnItemRequest
    extends SaleReturnItemInsert {

    productId: string;

    warehouseId: string;
    serialNumbers?: string[];

}

export interface CreateSaleReturnRequest {

  saleReturn: SaleReturnInsert;

  items: CreateSaleReturnItemRequest[];

}

export interface PostSaleReturnRequest {

  saleReturnId: string;

}