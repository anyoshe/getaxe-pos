import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  sales,
} from "@/db/schema/sales/sales";

import {
  saleItems,
} from "@/db/schema/sales/sale_items";

import type {
  PaymentInsert,
} from "./payment";

export type SaleInsert =
  InferInsertModel<typeof sales>;

export type SaleItemInsert =
  InferInsertModel<typeof saleItems>;

/* -------------------------------------------------------------------------- */
/*                                Sale Items                                  */
/* -------------------------------------------------------------------------- */

export type CreateSaleItemRequest =
  SaleItemInsert;

/* -------------------------------------------------------------------------- */
/*                                   Sales                                    */
/* -------------------------------------------------------------------------- */

export interface CreateSaleRequest {

  sale: SaleInsert;

  items: CreateSaleItemRequest[];

  payments: PaymentInsert[];

}

export interface PostSaleRequest {

  saleId: string;

}

/* -------------------------------------------------------------------------- */
/*                                   Void Sales                                    */
/* -------------------------------------------------------------------------- */

export interface VoidSaleRequest {

    saleId: string;

    voidedBy: string;

    reason: string;

}