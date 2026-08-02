import {
  and,
  asc,
  desc,
  eq,
  gte,
  lte,
} from "drizzle-orm";

import type { InferInsertModel } from "drizzle-orm";

import { stockMovements } from "@/db/schema/inventory/stock_movements";

type StockMovementInsert =
  InferInsertModel<typeof stockMovements>;


import {
  BaseRepository,
} from "../base";

export class StockMovementRepository
  extends BaseRepository {
  async findAll(
    businessId: string
  ) {
    return this.database.query.stockMovements.findMany({
      where: eq(
        stockMovements.businessId,
        businessId
      ),

      with: {
        product: true,
        batch: true,
        warehouse: true,
        user: true,
      },

      orderBy: [
        desc(stockMovements.createdAt),
      ],
    });
  }

  async findById(
    id: string
  ) {
    return this.database.query.stockMovements.findFirst({
      where: eq(
        stockMovements.id,
        id
      ),

      with: {
        product: true,
        batch: true,
        warehouse: true,
        user: true,
      },
    });
  }

  async create(
    data: StockMovementInsert
  ) {
    const [movement] =
      await this.database
        .insert(stockMovements)
        .values(data)
        .returning();

    return movement;
  }

  async findByProduct(
    productId: string
  ) {
    return this.database.query.stockMovements.findMany({
      where: eq(
        stockMovements.productId,
        productId
      ),

      with: {
        batch: true,
        warehouse: true,
        user: true,
      },

      orderBy: [
        desc(stockMovements.createdAt),
      ],
    });
  }

  async findByBatch(
    batchId: string
  ) {
    return this.database.query.stockMovements.findMany({
      where: eq(
        stockMovements.batchId,
        batchId
      ),

      with: {
        product: true,
        warehouse: true,
        user: true,
      },

      orderBy: [
        desc(stockMovements.createdAt),
      ],
    });
  }

  async findByReference(
    businessId: string,
    reference: string
  ) {
    return this.database.query.stockMovements.findMany({
      where: and(
        eq(
          stockMovements.businessId,
          businessId
        ),
        eq(
          stockMovements.reference,
          reference
        )
      ),

      with: {
        product: true,
        batch: true,
        warehouse: true,
      },

      orderBy: [
        asc(stockMovements.createdAt),
      ],
    });
  }

  async findBetweenDates(
    businessId: string,
    from: Date,
    to: Date
  ) {
    return this.database.query.stockMovements.findMany({
      where: and(
        eq(
          stockMovements.businessId,
          businessId
        ),
        gte(
          stockMovements.createdAt,
          from
        ),
        lte(
          stockMovements.createdAt,
          to
        )
      ),

      with: {
        product: true,
        batch: true,
        warehouse: true,
        user: true,
      },

      orderBy: [
        desc(stockMovements.createdAt),
      ],
    });
  }

  async findRecent(
    businessId: string,
    limit = 20
  ) {
    return this.database.query.stockMovements.findMany({
      where: eq(
        stockMovements.businessId,
        businessId
      ),

      with: {
        product: true,
        batch: true,
        warehouse: true,
        user: true,
      },

      orderBy: [
        desc(stockMovements.createdAt),
      ],

      limit,
    });
  }
}

export const stockMovementRepository =
  new StockMovementRepository();