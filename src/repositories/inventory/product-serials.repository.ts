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
}

export const productSerialRepository = new ProductSerialRepository();
