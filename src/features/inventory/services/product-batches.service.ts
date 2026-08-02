import { productBatchRepository } from "@/repositories/inventory";

import type { InferInsertModel } from "drizzle-orm";
import { productBatches } from "@/db/schema/inventory/product_batches";

type ProductBatchInsert =
  InferInsertModel<typeof productBatches>;

export class ProductBatchService {
  async getProductBatches(
    businessId: string
  ) {
    return productBatchRepository.findAll(
      businessId
    );
  }

  async getProductBatch(
    id: string
  ) {
    const batch =
      await productBatchRepository.findById(id);

    if (!batch) {
      throw new Error(
        "Product batch not found."
      );
    }

    return batch;
  }

  async createProductBatch(
    data: ProductBatchInsert
  ) {
    const exists =
      await productBatchRepository.existsByBatchNumber(
        data.businessId,
        data.productId,
        data.batchNumber
      );

    if (exists) {
      throw new Error(
        "Batch number already exists for this product."
      );
    }

    if (
      data.manufactureDate &&
      data.expiryDate &&
      data.expiryDate < data.manufactureDate
    ) {
      throw new Error(
        "Expiry date cannot be earlier than manufacture date."
      );
    }

    if (
      data.quantityRemaining >
      data.quantityReceived
    ) {
      throw new Error(
        "Remaining quantity cannot exceed received quantity."
      );
    }

    return productBatchRepository.create(
      data
    );
  }

  async updateProductBatch(
    id: string,
    data: Partial<ProductBatchInsert>
  ) {
    const existing =
      await productBatchRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Product batch not found."
      );
    }

    const batchNumber =
      data.batchNumber ??
      existing.batchNumber;

    const productId =
      data.productId ??
      existing.productId;

    if (
      batchNumber !== existing.batchNumber ||
      productId !== existing.productId
    ) {
      const exists =
        await productBatchRepository.existsByBatchNumber(
          existing.businessId,
          productId,
          batchNumber
        );

      if (exists) {
        throw new Error(
          "Batch number already exists for this product."
        );
      }
    }

    const manufactureDate =
      data.manufactureDate ??
      existing.manufactureDate;

    const expiryDate =
      data.expiryDate ??
      existing.expiryDate;

    if (
      manufactureDate &&
      expiryDate &&
      expiryDate < manufactureDate
    ) {
      throw new Error(
        "Expiry date cannot be earlier than manufacture date."
      );
    }

    const quantityReceived =
      data.quantityReceived ??
      existing.quantityReceived;

    const quantityRemaining =
      data.quantityRemaining ??
      existing.quantityRemaining;

    if (
      quantityRemaining >
      quantityReceived
    ) {
      throw new Error(
        "Remaining quantity cannot exceed received quantity."
      );
    }

    return productBatchRepository.update(
      id,
      data
    );
  }

  async deleteProductBatch(
    id: string
  ) {
    const existing =
      await productBatchRepository.findById(id);

    if (!existing) {
      throw new Error(
        "Product batch not found."
      );
    }

    if (
      existing.quantityRemaining > 0
    ) {
      throw new Error(
        "Cannot archive a batch that still has stock remaining."
      );
    }

    return productBatchRepository.deactivate(
      id
    );
  }

  async getAvailableQuantity(
    productId: string
  ) {
    return productBatchRepository.getAvailableQuantity(
      productId
    );
  }

  async getAvailableBatches(
    productId: string
  ) {
    return productBatchRepository.findAvailableBatches(
      productId
    );
  }

  async getExpiringBatches(
    businessId: string,
    date: string
  ) {
    return productBatchRepository.findExpiringBefore(
      businessId,
      date
    );
  }
}

export const productBatchService =
  new ProductBatchService();