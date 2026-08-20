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

    if (request.serialized && !request.serialNumbers?.length) {
      throw new Error("Serialized products require serial numbers.");
    }

    if (!request.serialized && request.serialNumbers?.length) {
      throw new Error("Serial numbers are only valid for serialized products.");
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

    if (request.serialNumbers) {
      const serialNumbers = request.serialNumbers.map((serial) => serial.trim());
      if (serialNumbers.some((serial) => !serial)) {
        throw new Error("Serial numbers cannot be empty.");
      }
      if (new Set(serialNumbers).size !== serialNumbers.length) {
        throw new Error("Duplicate serial numbers cannot be issued.");
      }
      if (serialNumbers.length !== request.quantity) {
        throw new Error("The number of serial numbers must equal the issue quantity.");
      }
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

  if (request.serialNumbers) {
    const serialNumbers = request.serialNumbers.map((serial) => serial.trim());
    if (serialNumbers.some((serial) => !serial)) {
      throw new Error("Serial numbers cannot be empty.");
    }
    if (new Set(serialNumbers).size !== serialNumbers.length) {
      throw new Error("Duplicate serial numbers cannot be adjusted.");
    }
    if (serialNumbers.length !== Math.abs(request.quantity)) {
      throw new Error(
        "The number of serial numbers must equal the absolute adjustment quantity.",
      );
    }
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

    if (request.serialNumbers) {
      const serialNumbers = request.serialNumbers.map((serial) => serial.trim());
      if (serialNumbers.some((serial) => !serial)) {
        throw new Error("Serial numbers cannot be empty.");
      }
      if (new Set(serialNumbers).size !== serialNumbers.length) {
        throw new Error("Duplicate serial numbers cannot be transferred.");
      }
      if (serialNumbers.length !== request.quantity) {
        throw new Error("The number of serial numbers must equal the transfer quantity.");
      }
    }

  }

}


export const inventoryValidator =
  new InventoryValidator();