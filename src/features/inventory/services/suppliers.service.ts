import { supplierRepository } from "@/repositories/inventory";

import type { InferInsertModel } from "drizzle-orm";
import { suppliers } from "@/db/schema/inventory/suppliers";

type SupplierInsert = InferInsertModel<typeof suppliers>;

export class SupplierService {
  async getSuppliers(businessId: string) {
    return supplierRepository.findAll(businessId);
  }

  async getSupplier(id: string, businessId: string) {
    const supplier = await supplierRepository.findById(id, businessId);

    if (!supplier) {
      throw new Error("Supplier not found.");
    }

    return supplier;
  }

  async createSupplier(data: SupplierInsert) {
    const exists = await supplierRepository.existsByName(
      data.businessId,
      data.name,
    );

    if (exists) {
      throw new Error("Supplier already exists.");
    }

    return supplierRepository.create(data);
  }

  async updateSupplier(
    id: string,
    data: Partial<SupplierInsert>,
    businessId: string,
  ) {
    const existing = await supplierRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Supplier not found.");
    }

    if (data.name && data.name !== existing.name) {
      const exists = await supplierRepository.existsByName(
        existing.businessId,
        data.name,
      );

      if (exists) {
        throw new Error("Supplier already exists.");
      }
    }

    return supplierRepository.update(id, businessId, data);
  }

  async deleteSupplier(id: string, businessId: string) {
    const existing = await supplierRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Supplier not found.");
    }

    return supplierRepository.deactivate(id, businessId);
  }

  async activateSupplier(id: string, businessId: string) {
    const existing = await supplierRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Supplier not found.");
    }

    return supplierRepository.update(id, businessId, {
      active: true,
    });
  }
}

export const supplierService = new SupplierService();
