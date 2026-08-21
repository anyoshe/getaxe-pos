import { Repository } from "@/repositories/base";

import { InventoryUnitOfWork } from "./unit-of-work";

import type { InventoryOperationsContext } from "../types";

import type {
  ReceiveStockRequest,
  IssueStockRequest,
  IssueAllocatedStockRequest,
  AdjustStockRequest,
  TransferStockRequest,
} from "../types";

import { inventoryValidator } from "./inventory-validator";

export class InventoryService {
  async receiveStock(request: ReceiveStockRequest) {
    inventoryValidator.validateReceive(request);

    return Repository.withTransaction(async (tx) => {
      const uow = new InventoryUnitOfWork(tx);

      return this.receiveStockWithUnitOfWork(uow, request);
    });
  }

  async receiveStockWithUnitOfWork(
    uow: InventoryUnitOfWork,
    request: ReceiveStockRequest,
  ) {
    const serialNumbers = (request.serialNumbers ?? [])
      .map((serial) => serial.trim())
      .filter(Boolean);

    if (serialNumbers.length > 0) {
      if (serialNumbers.length !== request.batch.quantityReceived) {
        throw new Error(
          `Expected ${request.batch.quantityReceived} serial numbers, got ${serialNumbers.length}.`,
        );
      }

      if (new Set(serialNumbers).size !== serialNumbers.length) {
        throw new Error("Duplicate serial numbers in this receipt.");
      }

      const existing = await uow.serials.findExistingSerials(
        request.batch.businessId,
        serialNumbers,
      );

      if (existing.length > 0) {
        throw new Error(
          `Serial number(s) already exist: ${existing.map((s) => s.serialNumber).join(", ")}`,
        );
      }
    }

    const batch = await uow.batches.create(request.batch);

    const existingBalance = await uow.balances.findByBatchWarehouse(
      batch.id,
      request.warehouseId,
    );

    let balance;

    if (existingBalance) {
      balance = await uow.balances.increaseQuantity(
        existingBalance.id,
        batch.quantityReceived,
      );
    } else {
      balance = await uow.balances.create({
        businessId: batch.businessId,
        productId: batch.productId,
        batchId: batch.id,
        warehouseId: request.warehouseId,
        quantity: batch.quantityReceived,
      });
    }

    const movement = await uow.movements.create({
      ...request.movement,
      batchId: batch.id,
      warehouseId: request.warehouseId,
    });

    let serials: Awaited<ReturnType<typeof uow.serials.createMany>> = [];

    if (serialNumbers.length > 0) {
      serials = await uow.serials.createMany(
        serialNumbers.map((serialNumber) => ({
          businessId: batch.businessId,
          productId: batch.productId,
          batchId: batch.id,
          warehouseId: request.warehouseId,
          serialNumber,
          status: "AVAILABLE",
          stockMovementId: movement.id,
        })),
      );
    }

    return {
      batch,
      balance,
      movement,
      serials,
    };
  }

  async issueStock(request: IssueStockRequest) {
    inventoryValidator.validateIssue(request);

    return Repository.withTransaction(async (tx) => {
      const uow = new InventoryUnitOfWork(tx);

      return this.issueStockWithUnitOfWork(uow, request);
    });
  }

  async issueStockWithUnitOfWork(
    uow: InventoryUnitOfWork,
    request: IssueStockRequest,
  ) {
    const batch = await uow.batches.findById(request.batchId);

    if (!batch) {
      throw new Error("Stock batch not found.");
    }

    const balance = await uow.balances.findByBatchWarehouseForUpdate(
      request.batchId,
      request.warehouseId,
    );

    if (!balance) {
      throw new Error("No stock available in this warehouse.");
    }

    if (balance.quantity < request.quantity) {
      throw new Error("Insufficient warehouse stock.");
    }

    if (batch.quantityRemaining < request.quantity) {
      throw new Error("Insufficient batch quantity.");
    }

    const updatedBalance = await uow.balances.decreaseQuantity(
      balance.id,
      request.quantity,
    );

    const updatedBatch = await uow.batches.decreaseQuantity(
      request.batchId,
      undefined,
      request.quantity,
    );

    const movement = await uow.movements.create({
      ...request.movement,

      batchId: request.batchId,

      warehouseId: request.warehouseId,

      quantity: -request.quantity,
    });

    return {
      batch: updatedBatch,
      balance: updatedBalance,
      movement,
    };
  }

  async issueAllocatedStockWithUnitOfWork(
    uow: InventoryOperationsContext,
    request: IssueAllocatedStockRequest,
  ) {
    const movements = [];

    for (const allocation of request.allocations) {
      const batch = await uow.batches.findById(
        allocation.batchId,
        request.businessId,
      );

      if (!batch) {
        throw new Error(`Batch ${allocation.batchId} not found.`);
      }

      const balance = await uow.balances.findByBatchWarehouseForUpdate(
        allocation.batchId,
        allocation.warehouseId,
      );

      if (!balance) {
        throw new Error("No stock available in selected warehouse.");
      }

      if (balance.quantity < allocation.quantity) {
        throw new Error(
          `Insufficient warehouse stock for batch ${batch.batchNumber}.`,
        );
      }

      if (batch.quantityRemaining < allocation.quantity) {
        throw new Error(
          `Insufficient remaining quantity for batch ${batch.batchNumber}.`,
        );
      }

      await uow.balances.decreaseQuantity(balance.id, allocation.quantity);

      await uow.batches.decreaseQuantity(
        allocation.batchId,
        request.businessId,
        allocation.quantity,
      );

      const movement = await uow.movements.create({
        ...request.movement,

        businessId: request.businessId,

        productId: request.productId,

        batchId: allocation.batchId,

        warehouseId: allocation.warehouseId,

        movementType: "SALE",

        quantity: -allocation.quantity,
      });

      movements.push(movement);
    }

    return movements;
  }

  async adjustStockWithUnitOfWork(
    uow: InventoryUnitOfWork,
    request: AdjustStockRequest,
  ) {
    const batch = await uow.batches.findById(request.batchId);

    if (!batch) {
      throw new Error("Stock batch not found.");
    }

    const newQuantity = batch.quantityRemaining + request.quantity;

    if (newQuantity < 0) {
      throw new Error("Adjustment would create negative stock.");
    }

    const updatedBatch = await uow.batches.update(request.batchId, undefined, {
      quantityRemaining: newQuantity,
    });

    const movement = await uow.movements.create({
      ...request.movement,

      batchId: request.batchId,

      quantity: request.quantity,
    });

    return {
      batch: updatedBatch,
      movement,
    };
  }

  async transferStockWithUnitOfWork(
    uow: InventoryUnitOfWork,
    request: TransferStockRequest,
  ) {
    const batch = await uow.batches.findById(request.batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    const source = await uow.balances.findByBatchWarehouseForUpdate(
      request.batchId,
      request.fromWarehouseId,
    );

    if (!source) {
      throw new Error("Source warehouse stock not found.");
    }

    if (source.quantity < request.quantity) {
      throw new Error("Insufficient stock for transfer.");
    }

    const destination = await uow.balances.findByBatchWarehouse(
      request.batchId,
      request.toWarehouseId,
    );

    await uow.balances.decreaseQuantity(source.id, request.quantity);

    let destinationBalance;

    if (destination) {
      destinationBalance = await uow.balances.increaseQuantity(
        destination.id,
        request.quantity,
      );
    } else {
      destinationBalance = await uow.balances.create({
        businessId: source.businessId,

        productId: request.productId,

        batchId: request.batchId,

        warehouseId: request.toWarehouseId,

        quantity: request.quantity,
      });
    }

    const outMovement = await uow.movements.create({
      businessId: source.businessId,

      productId: request.productId,

      batchId: request.batchId,

      warehouseId: request.fromWarehouseId,

      movementType: "TRANSFER_OUT",

      quantity: -request.quantity,

      reference: request.movement.reference,

      notes: request.movement.notes,

      userId: request.movement.userId,
    });

    const inMovement = await uow.movements.create({
      businessId: source.businessId,

      productId: request.productId,

      batchId: request.batchId,

      warehouseId: request.toWarehouseId,

      movementType: "TRANSFER_IN",

      quantity: request.quantity,

      reference: request.movement.reference,

      notes: request.movement.notes,

      userId: request.movement.userId,
    });

    return {
      destinationBalance,
      outMovement,
      inMovement,
    };
  }
}

export const inventoryService = new InventoryService();
