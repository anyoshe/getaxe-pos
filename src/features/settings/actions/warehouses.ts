"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { warehousesService } from "../services/warehouses.service";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "../schemas/warehouse";

export async function getWarehouses(businessId: string) {
  await requireAuthorizedUser("warehouses.view");
  return warehousesService.getWarehouses(businessId);
}

export async function getWarehouse(id: string, businessId: string) {
  await requireAuthorizedUser("warehouses.view");
  return warehousesService.getWarehouse(id, businessId);
}

export async function createWarehouse(input: unknown) {
  await requireAuthorizedUser("warehouses.create");
  const data = createWarehouseSchema.parse(input);
  const warehouse = await warehousesService.createWarehouse(data);
  revalidatePath("/settings/warehouses");
  return warehouse;
}

export async function updateWarehouse(
  id: string,
  businessId: string,
  input: unknown,
) {
  await requireAuthorizedUser("warehouses.update");
  const data = updateWarehouseSchema.parse(input);
  const warehouse = await warehousesService.updateWarehouse(
    id,
    businessId,
    data,
  );
  revalidatePath("/settings/warehouses");
  return warehouse;
}

export async function deleteWarehouse(id: string, businessId: string) {
  await requireAuthorizedUser("warehouses.delete");
  const warehouse = await warehousesService.deleteWarehouse(id, businessId);
  revalidatePath("/settings/warehouses");
  return warehouse;
}
