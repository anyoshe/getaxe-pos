import { qty, qtyStr } from "@/lib/quantity";
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
      if (serialNumbers.length !== qty(request.batch.quantityReceived)) {
        throw new Error(
          `Expected ${qty(request.batch.quantityReceived)} serial numbers, got ${serialNumbers.length}.`,
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

    const incomingQty = qty(request.batch.quantityReceived);
    const batchNumber = String(request.batch.batchNumber ?? "").trim();

    let batch = batchNumber
      ? await uow.batches.findByProductAndBatchNumber(
          request.batch.businessId,
          request.batch.productId,
          batchNumber,
        )
      : null;

    if (batch) {
      // Re-receive same lot after adjustment / partial: add qty, refresh costs/dates
      batch = await uow.batches.update(batch.id, request.batch.businessId, {
        quantityReceived: qtyStr(qty(batch.quantityReceived) + incomingQty),
        quantityRemaining: qtyStr(qty(batch.quantityRemaining) + incomingQty),
        costPrice: request.batch.costPrice ?? batch.costPrice,
        supplierId: request.batch.supplierId ?? batch.supplierId,
        expiryDate: request.batch.expiryDate ?? batch.expiryDate,
        manufactureDate:
          request.batch.manufactureDate ?? batch.manufactureDate,
        active: true,
      });
    } else {
      batch = await uow.batches.create(request.batch);
    }

    if (!batch) {
      throw new Error("Failed to create or update product batch.");
    }

    const existingBalance = await uow.balances.findByBatchWarehouse(
      batch.id,
      request.warehouseId,
    );

    let balance;

    if (existingBalance) {
      balance = await uow.balances.increaseQuantity(
        existingBalance.id,
        incomingQty,
      );
    } else {
      balance = await uow.balances.create({
        businessId: batch.businessId,
        productId: batch.productId,
        batchId: batch.id,
        warehouseId: request.warehouseId,
        quantity: qtyStr(incomingQty),
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

    if (qty(balance.quantity) < request.quantity) {
      throw new Error("Insufficient warehouse stock.");
    }

    if (qty(batch.quantityRemaining) < request.quantity) {
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

      quantity: qtyStr(-request.quantity),
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

      if (qty(balance.quantity) < allocation.quantity) {
        throw new Error(
          `Insufficient warehouse stock for batch ${batch.batchNumber}.`,
        );
      }

      if (qty(batch.quantityRemaining) < allocation.quantity) {
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

        quantity: qtyStr(-allocation.quantity),
      });

      movements.push(movement);
    }

    return movements;
  }

  async adjustStock(request: AdjustStockRequest) {
    inventoryValidator.validateAdjustment(request);

    return Repository.withTransaction(async (tx) => {
      const uow = new InventoryUnitOfWork(tx);
      return this.adjustStockWithUnitOfWork(uow, request);
    });
  }

  async transferStock(request: TransferStockRequest) {
    inventoryValidator.validateTransfer(request);

    return Repository.withTransaction(async (tx) => {
      const uow = new InventoryUnitOfWork(tx);
      return this.transferStockWithUnitOfWork(uow, request);
    });
  }

  async adjustStockWithUnitOfWork(
    uow: InventoryUnitOfWork,
    request: AdjustStockRequest,
  ) {
    const batch = await uow.batches.findById(request.batchId);

    if (!batch) {
      throw new Error("Stock batch not found.");
    }

    // Warehouse balance is source of truth (same as Stock on Hand / POS)
    const balance = await uow.balances.findByBatchWarehouseForUpdate(
      request.batchId,
      request.warehouseId,
    );

    const onHand = balance ? Number(balance.quantity) : 0;
    const nextOnHand = onHand + request.quantity;

    if (nextOnHand < 0) {
      throw new Error(
        `Adjustment would create negative warehouse stock (on hand ${onHand}, change ${request.quantity}).`,
      );
    }

    let updatedBalance = balance;

    if (balance) {
      if (request.quantity > 0) {
        updatedBalance = await uow.balances.increaseQuantity(
          balance.id,
          request.quantity,
        );
      } else if (request.quantity < 0) {
        updatedBalance = await uow.balances.decreaseQuantity(
          balance.id,
          Math.abs(request.quantity),
        );
      }
    } else if (request.quantity > 0) {
      updatedBalance = await uow.balances.create({
        businessId: batch.businessId,
        productId: batch.productId,
        batchId: batch.id,
        warehouseId: request.warehouseId,
        quantity: qtyStr(request.quantity),
      });
    } else if (request.quantity < 0) {
      throw new Error("No warehouse balance to adjust down.");
    }

    // Keep batch remaining aligned with warehouse on-hand for this batch line
    const updatedBatch = await uow.batches.update(request.batchId, undefined, {
      quantityRemaining: qtyStr(nextOnHand),
    });

    const movement = await uow.movements.create({
      ...request.movement,
      batchId: request.batchId,
      warehouseId: request.warehouseId,
      productId: batch.productId,
      businessId: batch.businessId,
      movementType: "ADJUSTMENT",
      quantity: qtyStr(request.quantity),
    });

    return {
      batch: updatedBatch,
      balance: updatedBalance,
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

    if (qty(source.quantity) < request.quantity) {
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

        quantity: qtyStr(request.quantity),
      });
    }

    const outMovement = await uow.movements.create({
      businessId: source.businessId,

      productId: request.productId,

      batchId: request.batchId,

      warehouseId: request.fromWarehouseId,

      movementType: "TRANSFER_OUT",

      quantity: qtyStr(-request.quantity),

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

      quantity: qtyStr(request.quantity),

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
