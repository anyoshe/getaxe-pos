import type {
  Database,
  Transaction,
} from "@/repositories/base";

import {
  PurchaseOrderRepository,
  PurchaseOrderItemRepository,
  GoodsReceiptRepository,
  GoodsReceiptItemRepository,
  SupplierReturnRepository,
  SupplierReturnItemRepository,
} from "@/repositories/purchasing";

import {
  ProductBatchRepository,
  InventoryBalanceRepository,
  StockMovementRepository,
} from "@/repositories/inventory";

export class PurchasingUnitOfWork {

  readonly purchaseOrders:
    PurchaseOrderRepository;

  readonly purchaseOrderItems:
    PurchaseOrderItemRepository;

  readonly goodsReceipts:
    GoodsReceiptRepository;

  readonly goodsReceiptItems:
    GoodsReceiptItemRepository;

  readonly supplierReturns:
    SupplierReturnRepository;

  readonly supplierReturnItems:
    SupplierReturnItemRepository;

  /*
   * Inventory repositories
   * Purchasing posts inventory movements,
   * therefore these repositories are shared.
   */

  readonly batches:
    ProductBatchRepository;

  readonly balances:
    InventoryBalanceRepository;

  readonly stockMovements:
    StockMovementRepository;

  constructor(
    database: Database | Transaction
  ) {

    this.purchaseOrders =
      new PurchaseOrderRepository(
        database
      );

    this.purchaseOrderItems =
      new PurchaseOrderItemRepository(
        database
      );

    this.goodsReceipts =
      new GoodsReceiptRepository(
        database
      );

    this.goodsReceiptItems =
      new GoodsReceiptItemRepository(
        database
      );

    this.supplierReturns =
      new SupplierReturnRepository(
        database
      );

    this.supplierReturnItems =
      new SupplierReturnItemRepository(
        database
      );

    this.batches =
      new ProductBatchRepository(
        database
      );

    this.balances =
      new InventoryBalanceRepository(
        database
      );

    this.stockMovements =
      new StockMovementRepository(
        database
      );

  }

}