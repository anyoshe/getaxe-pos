import type {
  ApprovePurchaseOrderRequest,
  CreatePurchaseOrderRequest,
  CreateSupplierReturnRequest,
  PostGoodsReceiptRequest,
  PostSupplierReturnRequest,
  ReceiveGoodsRequest,
} from "../types";

export class PurchasingValidator {

  validateCreatePurchaseOrder(
    request: CreatePurchaseOrderRequest
  ) {

    if (!request.order.businessId) {
      throw new Error(
        "Business is required."
      );
    }

    if (!request.order.supplierId) {
      throw new Error(
        "Supplier is required."
      );
    }

    if (request.items.length === 0) {
      throw new Error(
        "Purchase order must contain at least one item."
      );
    }

    for (const item of request.items) {

      if (!item.productId) {
        throw new Error(
          "Product is required."
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

    }

  }

  validateApprovePurchaseOrder(
    request: ApprovePurchaseOrderRequest
  ) {

    if (!request.purchaseOrderId) {
      throw new Error(
        "Purchase order is required."
      );
    }

    if (!request.approvedBy) {
      throw new Error(
        "Approver is required."
      );
    }

  }

  validateReceiveGoods(
    request: ReceiveGoodsRequest
  ) {

    if (!request.receipt.businessId) {
      throw new Error(
        "Business is required."
      );
    }

    if (!request.receipt.supplierId) {
      throw new Error(
        "Supplier is required."
      );
    }

    if (!request.warehouseId) {
      throw new Error(
        "Warehouse is required."
      );
    }

    if (request.items.length === 0) {
      throw new Error(
        "Receipt must contain at least one item."
      );
    }

    for (const item of request.items) {

      if (!item.productId) {
        throw new Error(
          "Product is required."
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

    }

  }

  validatePostGoodsReceipt(
    request: PostGoodsReceiptRequest
  ) {

    if (!request.goodsReceiptId) {
      throw new Error(
        "Goods receipt is required."
      );
    }

  }

  validateCreateSupplierReturn(
    request: CreateSupplierReturnRequest
  ) {

    if (!request.supplierReturn.businessId) {
      throw new Error(
        "Business is required."
      );
    }

    if (!request.supplierReturn.supplierId) {
      throw new Error(
        "Supplier is required."
      );
    }

    if (request.items.length === 0) {
      throw new Error(
        "Supplier return must contain at least one item."
      );
    }

    for (const item of request.items) {

      if (!item.productId) {
        throw new Error(
          "Product is required."
        );
      }

      if (item.quantity <= 0) {
        throw new Error(
          "Quantity must be greater than zero."
        );
      }

    }

  }

  validatePostSupplierReturn(
    request: PostSupplierReturnRequest
  ) {

    if (!request.supplierReturnId) {
      throw new Error(
        "Supplier return is required."
      );
    }

  }


}

export const purchasingValidator =
  new PurchasingValidator();