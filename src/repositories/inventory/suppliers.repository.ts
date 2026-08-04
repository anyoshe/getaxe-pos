import { and, eq, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { suppliers } from "@/db/schema/inventory/suppliers";

type SupplierInsert = InferInsertModel<typeof suppliers>;

import { BaseRepository } from "../base";

export class SupplierRepository extends BaseRepository {
  async findAll(businessId: string) {
    return this.database.query.suppliers.findMany({
      where: and(
        eq(suppliers.businessId, businessId),
        eq(suppliers.active, true),
      ),
      orderBy: (suppliers, { asc }) => [asc(suppliers.name)],
      with: {
        products: true,
      },
    });
  }

  async findById(id: string) {
    return this.database.query.suppliers.findFirst({
      where: eq(suppliers.id, id),
      with: {
        products: true,
      },
    });
  }

  async create(data: SupplierInsert) {
    const [supplier] = await this.database
      .insert(suppliers)
      .values(data)
      .returning();

    return supplier;
  }

  async update(id: string, data: Partial<SupplierInsert>) {
    const [supplier] = await this.database
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.id, id))
      .returning();

    return supplier;
  }

  async delete(id: string) {
    const [supplier] = await this.database
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();

    return supplier;
  }

  async deactivate(id: string) {
    const [supplier] = await this.database
      .update(suppliers)
      .set({
        active: false,
      })
      .where(eq(suppliers.id, id))
      .returning();

    return supplier;
  }

  async existsByName(businessId: string, name: string) {
    if (!name) {
      return false;
    }

    const supplier = await this.database.query.suppliers.findFirst({
      where: and(
        eq(suppliers.businessId, businessId),
        eq(suppliers.name, name),
      ),
    });

    return !!supplier;
  }

  async count(businessId: string) {
    const result = await this.database
      .select({
        count: sql<number>`count(*)`,
      })
      .from(suppliers)
      .where(eq(suppliers.businessId, businessId));

    return Number(result[0]?.count ?? 0);
  }
}

export const supplierRepository = new SupplierRepository();
