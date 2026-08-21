import type {
  TransferStockRequest,
  ReceiveStockRequest,
  IssueStockRequest,
  AdjustStockRequest,
} from "../types";


export class InventoryValidator {


  validateReceive(
    request: ReceiveStockRequest
  ) {

    if (
      request.batch.quantityReceived <= 0
    ) {
      throw new Error(
        "Received quantity must be greater than zero."
      );
    }


    if (
      !request.warehouseId
    ) {
      throw new Error(
        "Warehouse is required."
      );
    }

    const serialNumbers = request.serialNumbers ?? [];
    if (serialNumbers.length > 0) {
      if (serialNumbers.length !== request.batch.quantityReceived) {
        throw new Error(
          `Serial count (${serialNumbers.length}) must match quantity (${request.batch.quantityReceived}).`,
        );
      }
    }

  }



  validateIssue(
    request: IssueStockRequest
  ) {

    if (
      request.quantity <= 0
    ) {
      throw new Error(
        "Issue quantity must be greater than zero."
      );
    }


    if (
      !request.warehouseId
    ) {
      throw new Error(
        "Warehouse is required."
      );
    }


    if (
      !request.batchId
    ) {
      throw new Error(
        "Batch is required."
      );
    }

  }



  validateAdjustment(
  request: AdjustStockRequest
) {

  if (
    request.quantity === 0
  ) {
    throw new Error(
      "Adjustment quantity cannot be zero."
    );
  }


  if (
    !request.batchId
  ) {
    throw new Error(
      "Batch is required."
    );
  }


  if (
    !request.warehouseId
  ) {
    throw new Error(
      "Warehouse is required."
    );
  }

}


  validateTransfer(
    request: TransferStockRequest
  ) {

    if (
      request.quantity <= 0
    ) {
      throw new Error(
        "Transfer quantity must be greater than zero."
      );
    }


    if (
      request.fromWarehouseId ===
      request.toWarehouseId
    ) {
      throw new Error(
        "Source and destination warehouse cannot be the same."
      );
    }


    if (
      !request.batchId
    ) {
      throw new Error(
        "Batch is required for transfer."
      );
    }

  }

}


export const inventoryValidator =
  new InventoryValidator();