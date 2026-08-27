import { qty } from "@/lib/quantity";
import { stockMovementRepository } from "@/repositories/inventory";

import type { InferInsertModel } from "drizzle-orm";

import { stockMovements } from "@/db/schema/inventory/stock_movements";

type StockMovementInsert =
  InferInsertModel<typeof stockMovements>;

export class StockMovementService {
  async getStockMovements(
    businessId: string
  ) {
    return stockMovementRepository.findAll(
      businessId
    );
  }

  async getStockMovement(
  id: string,
  businessId: string
) {
    const movement =
  await stockMovementRepository.findById(
    id,
    businessId
  );

    if (!movement) {
      throw new Error(
        "Stock movement not found."
      );
    }

    return movement;
  }

  async createStockMovement(
    data: StockMovementInsert
  ) {
    if (qty(data.quantity) === 0) {
      throw new Error(
        "Quantity cannot be zero."
      );
    }

    return stockMovementRepository.create(
      data
    );
  }

  async getProductHistory(
    productId: string,
    businessId: string
  ) {
   return stockMovementRepository.findByProduct(
  productId,
  businessId
);
  }

  async getBatchHistory(
    batchId: string,
    businessId: string
  ) {
    return stockMovementRepository.findByBatch(
  batchId,
  businessId
);
  }

  async getReferenceHistory(
    businessId: string,
    reference: string
  ) {
    return stockMovementRepository.findByReference(
      businessId,
      reference
    );
  }

  async getMovementsBetweenDates(
    businessId: string,
    from: Date,
    to: Date
  ) {
    return stockMovementRepository.findBetweenDates(
      businessId,
      from,
      to
    );
  }

  async getRecentMovements(
    businessId: string,
    limit = 20
  ) {
    return stockMovementRepository.findRecent(
      businessId,
      limit
    );
  }
}

export const stockMovementService =
  new StockMovementService();