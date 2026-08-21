import { and, eq, inArray } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { productSerials } from "@/db/schema/inventory/product_serials";
import { BaseRepository } from "../base";

type ProductSerialInsert = InferInsertModel<typeof productSerials>;

export class ProductSerialRepository extends BaseRepository {
  async createMany(rows: ProductSerialInsert[]) {
    if (rows.length === 0) return [];

    return this.database.insert(productSerials).values(rows).returning();
  }

  async findBySerialNumber(businessId: string, serialNumber: string) {
    return this.database.query.productSerials.findFirst({
      where: and(
        eq(productSerials.businessId, businessId),
        eq(productSerials.serialNumber, serialNumber),
      ),
    });
  }

  async findExistingSerials(businessId: string, serialNumbers: string[]) {
    if (serialNumbers.length === 0) return [];

    return this.database
      .select({
        serialNumber: productSerials.serialNumber,
      })
      .from(productSerials)
      .where(
        and(
          eq(productSerials.businessId, businessId),
          inArray(productSerials.serialNumber, serialNumbers),
        ),
      );
  }

  async findAvailableByProduct(
    businessId: string,
    productId: string,
    warehouseId?: string,
  ) {
    const conditions = [
      eq(productSerials.businessId, businessId),
      eq(productSerials.productId, productId),
      eq(productSerials.status, "AVAILABLE"),
    ];

    if (warehouseId) {
      conditions.push(eq(productSerials.warehouseId, warehouseId));
    }

    return this.database.query.productSerials.findMany({
      where: and(...conditions),
    });
  }

  async markSold(
    businessId: string,
    serialNumbers: string[],
    saleReference?: string | null,
  ) {
    if (serialNumbers.length === 0) return [];

    const rows = await this.database
      .update(productSerials)
      .set({
        status: "SOLD",
        updatedAt: new Date(),
        notes: saleReference ?? null,
      })
      .where(
        and(
          eq(productSerials.businessId, businessId),
          inArray(productSerials.serialNumber, serialNumbers),
          eq(productSerials.status, "AVAILABLE"),
        ),
      )
      .returning();

    if (rows.length !== serialNumbers.length) {
      const found = new Set(rows.map((r) => r.serialNumber));
      const missing = serialNumbers.filter((s) => !found.has(s));
      throw new Error(`Serial not available: ${missing.join(", ")}`);
    }

    return rows;
  }
}

export const productSerialRepository = new ProductSerialRepository();
