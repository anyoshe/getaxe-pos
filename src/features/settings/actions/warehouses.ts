"use server";

import { revalidatePath } from "next/cache";

import { warehousesService } from "../services/warehouses.service";

import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "../schemas/warehouse";

export async function getWarehouses(
  businessId: string
) {
  return warehousesService.getWarehouses(
    businessId
  );
}

export async function getWarehouse(
  id: string,
  businessId: string
) {
  return warehousesService.getWarehouse(
    id,
    businessId
  );
}

export async function createWarehouse(
  input: unknown
) {
  const data =
    createWarehouseSchema.parse(input);

  const warehouse =
    await warehousesService.createWarehouse(
      data
    );

  revalidatePath("/settings/warehouses");

  return warehouse;
}

export async function updateWarehouse(
  id: string,
  businessId: string,
  input: unknown
) {
  const data =
    updateWarehouseSchema.parse(input);

  const warehouse =
    await warehousesService.updateWarehouse(
      id,
      businessId,
      data
    );

  revalidatePath("/settings/warehouses");

  return warehouse;
}

export async function deleteWarehouse(
  id: string,
  businessId: string
) {
  const warehouse =
    await warehousesService.deleteWarehouse(
      id,
      businessId
    );

  revalidatePath("/settings/warehouses");

  return warehouse;
}