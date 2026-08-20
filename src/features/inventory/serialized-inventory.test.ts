import assert from "node:assert/strict";
import test from "node:test";

import { InventoryService } from "./services/inventory.service";
import { inventoryValidator } from "./services/inventory-validator";
import type { InventoryUnitOfWork } from "./services/unit-of-work";

const uuid = "123e4567-e89b-12d3-a456-426614174000";

function receiveRequest(overrides: Record<string, unknown> = {}) {
  return {
    serialized: true,
    serialNumbers: ["SN-001", "SN-002"],
    warehouseId: uuid,
    batch: {
      businessId: uuid,
      productId: uuid,
      batchNumber: "BATCH-1",
      costPrice: "10",
      quantityReceived: 2,
      quantityRemaining: 2,
      active: true,
    },
    movement: {
      businessId: uuid,
      productId: uuid,
      warehouseId: uuid,
      movementType: "PURCHASE" as const,
      quantity: 2,
    },
    ...overrides,
  };
}

test("serialized receive requires serial numbers", () => {
  assert.throws(
    () =>
      inventoryValidator.validateReceive(
        receiveRequest({ serialNumbers: [] }),
      ),
    /require serial numbers/,
  );
});

test("serialized receive rejects serial count mismatch", async () => {
  const uow = {
    serials: {
      findExistingSerials: async () => [],
    },
  } as unknown as InventoryUnitOfWork;

  await assert.rejects(
    () =>
      new InventoryService().receiveStockWithUnitOfWork(
        uow,
        receiveRequest({ serialNumbers: ["SN-001"] }),
      ),
    /requires exactly 2 serial numbers/,
  );
});

test("non-serialized receive rejects serial numbers", () => {
  assert.throws(
    () =>
      inventoryValidator.validateReceive(
        receiveRequest({ serialized: false }),
      ),
    /only valid for serialized/,
  );
});

test("non-serialized receive keeps quantity-based behavior", () => {
  assert.doesNotThrow(() =>
    inventoryValidator.validateReceive({
      ...receiveRequest({ serialized: false }),
      serialNumbers: undefined,
    }),
  );
});

test("duplicate issue serials are rejected", () => {
  assert.throws(
    () =>
      inventoryValidator.validateIssue({
        batchId: uuid,
        warehouseId: uuid,
        quantity: 2,
        serialNumbers: ["SN-001", "SN-001"],
        movement: {
          businessId: uuid,
          productId: uuid,
          warehouseId: uuid,
          movementType: "SALE",
          quantity: -2,
        },
      }),
    /Duplicate serial/,
  );
});

test("serialized receive creates one row per serial transactionally", async () => {
  const created: unknown[] = [];
  const uow = {
    batches: {
      create: async (data: Record<string, unknown>) => ({
        ...data,
        id: "batch-1",
      }),
    },
    balances: {
      findByBatchWarehouse: async () => null,
      create: async (data: Record<string, unknown>) => ({
        ...data,
        id: "balance-1",
      }),
    },
    movements: {
      create: async (data: Record<string, unknown>) => ({
        ...data,
        id: "movement-1",
      }),
    },
    serials: {
      findExistingSerials: async () => [],
      createMany: async (data: unknown[]) => {
        created.push(...data);
        return data;
      },
    },
  } as unknown as InventoryUnitOfWork;

  const result = await new InventoryService().receiveStockWithUnitOfWork(
    uow,
    receiveRequest(),
  );

  assert.equal(result.serials.length, 2);
  assert.equal(created.length, 2);
  assert.deepEqual(
    (created[0] as { serialNumber: string }).serialNumber,
    "SN-001",
  );
});

test("existing serials are rejected before inventory writes", async () => {
  let batchCreated = false;
  const uow = {
    batches: {
      create: async () => {
        batchCreated = true;
        return { id: "batch-1" };
      },
    },
    serials: {
      findExistingSerials: async () => [{ serialNumber: "SN-001" }],
    },
  } as unknown as InventoryUnitOfWork;

  await assert.rejects(
    () =>
      new InventoryService().receiveStockWithUnitOfWork(
        uow,
        receiveRequest(),
      ),
    /already registered/,
  );
  assert.equal(batchCreated, false);
});
