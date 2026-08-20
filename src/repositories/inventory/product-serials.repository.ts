import { and, eq, inArray } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { productSerials } from "@/db/schema/inventory/product_serials";

import { BaseRepository } from "../base";

type ProductSerialInsert = InferInsertModel<typeof productSerials>;

export class ProductSerialRepository extends BaseRepository {
  async create(data: ProductSerialInsert) {
    const [serial] = await this.database
      .insert(productSerials)
      .values(data)
      .returning();

    return serial;
  }

  async createMany(data: ProductSerialInsert[]) {
    if (data.length === 0) {
      return [];
    }

    return this.database
      .insert(productSerials)
      .values(data)
      .returning();
  }

  async exists(
    businessId: string,
    serialNumber: string,
  ) {
    const serial = await this.database.query.productSerials.findFirst({
      where: and(
        eq(productSerials.businessId, businessId),
        eq(productSerials.serialNumber, serialNumber),
      ),
    });

    return !!serial;
  }

  async findBySerialNumber(
    businessId: string,
    serialNumber: string,
  ) {
    return this.database.query.productSerials.findFirst({
      where: and(
        eq(productSerials.businessId, businessId),
        eq(productSerials.serialNumber, serialNumber),
      ),
      with: {
        product: true,
        batch: true,
        warehouse: true,
      },
    });
  }

  async findByProduct(
    businessId: string,
    productId: string,
  ) {
    return this.database.query.productSerials.findMany({
      where: and(
        eq(productSerials.businessId, businessId),
        eq(productSerials.productId, productId),
      ),
      orderBy: productSerials.createdAt,
    });
  }

  async findByBatch(
    businessId: string,
    batchId: string,
  ) {
    return this.database.query.productSerials.findMany({
      where: and(
        eq(productSerials.businessId, businessId),
        eq(productSerials.batchId, batchId),
      ),
      orderBy: productSerials.createdAt,
    });
  }

  async findInStock(
    businessId: string,
    productId: string,
    warehouseId?: string,
  ) {
    const conditions = [
      eq(productSerials.businessId, businessId),
      eq(productSerials.productId, productId),
      eq(productSerials.status, "IN_STOCK"),
    ];

    if (warehouseId) {
      conditions.push(eq(productSerials.warehouseId, warehouseId));
    }

    return this.database.query.productSerials.findMany({
      where: and(...conditions),
      orderBy: productSerials.createdAt,
    });
  }

  async findExistingSerials(
    businessId: string,
    serialNumbers: string[],
  ) {
    if (serialNumbers.length === 0) {
      return [];
    }

    return this.database.query.productSerials.findMany({
      where: and(
        eq(productSerials.businessId, businessId),
        inArray(productSerials.serialNumber, serialNumbers),
      ),
    });
  }
}