import { and, asc, eq, gt, lte, sql } from "drizzle-orm";

import type { InferInsertModel } from "drizzle-orm";

import { productBatches } from "@/db/schema/inventory/product_batches";

import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";

import { BaseRepository } from "../base";

type ProductBatchInsert = InferInsertModel<typeof productBatches>;

export class ProductBatchRepository extends BaseRepository {
  async findAll(businessId: string) {
    return this.database.query.productBatches.findMany({
      where: and(
        eq(productBatches.businessId, businessId),

        eq(productBatches.active, true),
      ),

      with: {
        product: true,
        supplier: true,
      },

      orderBy: [
        asc(productBatches.expiryDate),
        asc(productBatches.batchNumber),
      ],
    });
  }

  async findById(id: string, businessId?: string) {
    return this.database.query.productBatches.findFirst({
      where: businessId
        ? and(
            eq(productBatches.id, id),

            eq(productBatches.businessId, businessId),
          )
        : eq(productBatches.id, id),

      with: {
        product: true,
        supplier: true,
        stockMovements: true,
        saleItemBatches: true,
        saleReturnItems: true,
      },
    });
  }

  async findByProductAndBatchNumber(
    businessId: string,
    productId: string,
    batchNumber: string,
  ) {
    return this.database.query.productBatches.findFirst({
      where: and(
        eq(productBatches.businessId, businessId),
        eq(productBatches.productId, productId),
        eq(productBatches.batchNumber, batchNumber),
      ),
    });
  }

  async create(data: ProductBatchInsert) {
    const [batch] = await this.database
      .insert(productBatches)
      .values(data)
      .returning();

    return batch;
  }

  async update(
    id: string,
    businessId: string | undefined,
    data: Partial<ProductBatchInsert>,
  ) {
    const [batch] = await this.database
      .update(productBatches)
      .set(data)
      .where(
        businessId
          ? and(
              eq(productBatches.id, id),

              eq(productBatches.businessId, businessId),
            )
          : eq(productBatches.id, id),
      )
      .returning();

    return batch;
  }

  async delete(id: string, businessId?: string) {
    const [batch] = await this.database
      .delete(productBatches)
      .where(
        businessId
          ? and(
              eq(productBatches.id, id),

              eq(productBatches.businessId, businessId),
            )
          : eq(productBatches.id, id),
      )
      .returning();

    return batch;
  }

  async deactivate(id: string, businessId?: string) {
    const [batch] = await this.database
      .update(productBatches)
      .set({
        active: false,
      })
      .where(
        businessId
          ? and(
              eq(productBatches.id, id),

              eq(productBatches.businessId, businessId),
            )
          : eq(productBatches.id, id),
      )
      .returning();

    return batch;
  }

  async existsByBatchNumber(
    businessId: string,
    productId: string,
    batchNumber: string,
  ) {
    const batch = await this.database.query.productBatches.findFirst({
      where: and(
        eq(productBatches.businessId, businessId),

        eq(productBatches.productId, productId),

        eq(productBatches.batchNumber, batchNumber),
      ),
    });

    return !!batch;
  }

  async findAvailableBatches(businessId: string, productId: string) {
    return this.database.query.productBatches.findMany({
      where: and(
        eq(productBatches.businessId, businessId),

        eq(productBatches.productId, productId),

        eq(productBatches.active, true),

        gt(productBatches.quantityRemaining, "0"),
      ),

      orderBy: [asc(productBatches.expiryDate), asc(productBatches.createdAt)],
    });
  }

  async findAvailableBatchesByWarehouse(
    businessId: string,
    productId: string,
    warehouseId: string,
  ) {
    // Warehouse balance is the source of truth for POS / sales.
    // quantityRemaining on the batch can lag if older adjustments only
    // touched balances — still allow sale when balance has stock.
    const results = await this.database
      .select({
        batch: productBatches,
        balanceQuantity: inventoryBalances.quantity,
      })
      .from(productBatches)
      .innerJoin(
        inventoryBalances,
        eq(productBatches.id, inventoryBalances.batchId),
      )
      .where(
        and(
          eq(productBatches.businessId, businessId),
          eq(inventoryBalances.businessId, businessId),
          eq(productBatches.productId, productId),
          eq(productBatches.active, true),
          eq(inventoryBalances.warehouseId, warehouseId),
          gt(inventoryBalances.quantity, "0"),
        ),
      )
      .orderBy(asc(productBatches.expiryDate), asc(productBatches.createdAt));

    return results.map(({ batch, balanceQuantity }) => ({
      ...batch,
      // Prefer warehouse on-hand; never allocate more than either figure if both set
      quantityRemaining: Math.min(
        Number(balanceQuantity),
        Number(batch.quantityRemaining) > 0
          ? Number(batch.quantityRemaining)
          : Number(balanceQuantity),
      ),
    }));
  }

  async findExpiringBefore(businessId: string, date: string) {
    return this.database.query.productBatches.findMany({
      where: and(
        eq(productBatches.businessId, businessId),

        eq(productBatches.active, true),

        lte(productBatches.expiryDate, date),
      ),

      with: {
        product: true,
        supplier: true,
      },

      orderBy: [asc(productBatches.expiryDate)],
    });
  }

  async getAvailableQuantity(businessId: string, productId: string) {
    const result = await this.database
      .select({
        quantity: sql<number>`
              COALESCE(
                SUM(
                  ${productBatches.quantityRemaining}
                ),
                0
              )
            `,
      })
      .from(productBatches)
      .where(
        and(
          eq(productBatches.businessId, businessId),

          eq(productBatches.productId, productId),

          eq(productBatches.active, true),
        ),
      );

    return result[0]?.quantity ?? 0;
  }

  async increaseQuantity(
    id: string,
    businessId: string | undefined,
    quantity: number,
  ) {
    const [batch] = await this.database
      .update(productBatches)
      .set({
        quantityRemaining: sql`${productBatches.quantityRemaining} + ${quantity}`,
      })
      .where(
        businessId
          ? and(
              eq(productBatches.id, id),

              eq(productBatches.businessId, businessId),
            )
          : eq(productBatches.id, id),
      )
      .returning();

    return batch;
  }

  async decreaseQuantity(
    id: string,
    businessId: string | undefined,
    quantity: number,
  ) {
    const [batch] = await this.database
      .update(productBatches)
      .set({
        quantityRemaining: sql`GREATEST(0, ${productBatches.quantityRemaining} - ${quantity})`,
      })
      .where(
        businessId
          ? and(
              eq(productBatches.id, id),

              eq(productBatches.businessId, businessId),
            )
          : eq(productBatches.id, id),
      )
      .returning();

    return batch;
  }
}

export const productBatchRepository = new ProductBatchRepository();
