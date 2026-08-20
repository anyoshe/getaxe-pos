import type { InferInsertModel } from "drizzle-orm";

import { productBatches } from "@/db/schema/inventory/product_batches";
import { stockMovements } from "@/db/schema/inventory/stock_movements";
import { productSerials } from "@/db/schema/inventory/product_serials";

export type ProductBatchInsert =
  InferInsertModel<typeof productBatches>;

export type StockMovementInsert =
  InferInsertModel<typeof stockMovements>;

export type ProductSerialInsert =
  InferInsertModel<typeof productSerials>;

export interface ReceiveStockRequest {
  batch: ProductBatchInsert;
  warehouseId: string;
  movement: StockMovementInsert;
  serialized?: boolean;
  serialNumbers?: string[];
}

export interface IssueStockRequest {
  batchId: string;
  warehouseId: string;
  quantity: number;
  movement: StockMovementInsert;
  serialNumbers?: string[];
}

export interface AllocatedStockIssue {

    batchId: string;

    warehouseId: string;

    quantity: number;

}

export interface IssueAllocatedStockRequest {

    businessId: string;

    productId: string;

    allocations: AllocatedStockIssue[];

    movement: Omit<
        StockMovementInsert,
        | "batchId"
        | "productId"
        | "warehouseId"
        | "quantity"
    >;

}


export interface AdjustStockRequest {
  batchId: string;

  warehouseId: string;

  quantity: number;
  serialNumbers?: string[];

  movement: StockMovementInsert;
}

export interface TransferStockRequest {
  productId: string;

  batchId: string;

  fromWarehouseId: string;

  toWarehouseId: string;

  quantity: number;
  serialNumbers?: string[];
  movement: {
    reference?: string | null;
    notes?: string | null;
    userId?: string | null;
  };
}