import { warehousesRepository } from "@/repositories/settings/warehouses.repository";

import type {
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from "../schemas/warehouse";

class WarehousesService {
  async getWarehouses(businessId: string) {
    return warehousesRepository.findAll(businessId);
  }

  async getWarehouse(id: string, businessId: string) {
    const warehouse = await warehousesRepository.findById(id, businessId);

    if (!warehouse) {
      throw new Error("Warehouse not found.");
    }

    return warehouse;
  }

  async createWarehouse(data: CreateWarehouseInput) {
    const exists = await warehousesRepository.exists(data.code, data.branchId);

    if (exists) {
      throw new Error("Warehouse code already exists.");
    }

    return warehousesRepository.create(data);
  }

  async updateWarehouse(
    id: string,
    businessId: string,
    data: UpdateWarehouseInput,
  ) {
    const warehouse = await warehousesRepository.findById(id, businessId);

    if (!warehouse) {
      throw new Error("Warehouse not found.");
    }

    if (data.code && data.code !== warehouse.code) {
      const exists = await warehousesRepository.exists(
        data.code,
        warehouse.branchId,
      );

      if (exists) {
        throw new Error("Warehouse code already exists.");
      }
    }

    return warehousesRepository.update(id, businessId, data);
  }

  async deleteWarehouse(id: string, businessId: string) {
    const warehouse = await warehousesRepository.findById(id, businessId);

    if (!warehouse) {
      throw new Error("Warehouse not found.");
    }

    return warehousesRepository.delete(id, businessId);
  }

  async createDefaultWarehouse(businessId: string, branchId: string) {
    const existing = await warehousesRepository.findByCode("MAIN", branchId);

    if (existing) {
      return existing;
    }

    return warehousesRepository.create({
      businessId,

      branchId,

      code: "MAIN",

      name: "Head Office Warehouse",

      description: "Default warehouse",

      active: true,
    });
  }
}

export const warehousesService = new WarehousesService();
