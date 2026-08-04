import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { warehouses } from "@/db/schema/settings/warehouses";

export interface CreateWarehouseInput {
  businessId: string;
  branchId: string;
  code: string;
  name: string;
  description?: string | null;
  active?: boolean;
}

export interface UpdateWarehouseInput {
  branchId?: string;
  code?: string;
  name?: string;
  description?: string | null;
  active?: boolean;
}

class WarehousesRepository {
  async findAll(businessId: string) {
    return db.query.warehouses.findMany({
      where: eq(warehouses.businessId, businessId),
      with: {
        branch: true,
      },
      orderBy: asc(warehouses.name),
    });
  }

  async findById(id: string, businessId: string) {
    return db.query.warehouses.findFirst({
      where: and(eq(warehouses.id, id), eq(warehouses.businessId, businessId)),
      with: {
        branch: true,
      },
    });
  }

  async findByCode(code: string, branchId: string) {
    return db.query.warehouses.findFirst({
      where: and(eq(warehouses.code, code), eq(warehouses.branchId, branchId)),
    });
  }

  async exists(code: string, branchId: string) {
    const warehouse = await this.findByCode(code, branchId);

    return !!warehouse;
  }

  async count(businessId: string) {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(warehouses)
      .where(eq(warehouses.businessId, businessId));

    return Number(result[0]?.count ?? 0);
  }

  async create(data: CreateWarehouseInput) {
    const [warehouse] = await db.insert(warehouses).values(data).returning();

    return warehouse;
  }

  async update(id: string, businessId: string, data: UpdateWarehouseInput) {
    const [warehouse] = await db
      .update(warehouses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(warehouses.id, id), eq(warehouses.businessId, businessId)))
      .returning();

    return warehouse ?? null;
  }

  async delete(id: string, businessId: string) {
    const [warehouse] = await db
      .delete(warehouses)
      .where(and(eq(warehouses.id, id), eq(warehouses.businessId, businessId)))
      .returning();

    return warehouse ?? null;
  }
}

export const warehousesRepository = new WarehousesRepository();
