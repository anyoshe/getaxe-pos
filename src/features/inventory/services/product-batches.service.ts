import { qty } from "@/lib/quantity";
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
    id: string,
    businessId: string
  ) {
    const batch =
      await productBatchRepository.findById(
        id,
        businessId
      );

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
    businessId: string,
    data: Partial<ProductBatchInsert>
  ) {
    const existing =
      await productBatchRepository.findById(
        id,
        businessId
      );


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
          businessId,
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
      businessId,
      data
    );
  }


  async deleteProductBatch(
    id: string,
    businessId: string
  ) {

    const existing =
      await productBatchRepository.findById(
        id,
        businessId
      );


    if (!existing) {
      throw new Error(
        "Product batch not found."
      );
    }


    if (
      qty(existing.quantityRemaining) > 0
    ) {
      throw new Error(
        "Cannot archive a batch that still has stock remaining."
      );
    }


    return productBatchRepository.deactivate(
      id,
      businessId
    );
  }


  async getAvailableQuantity(
    businessId: string,
    productId: string
  ) {
    return productBatchRepository.getAvailableQuantity(
      businessId,
      productId
    );
  }


  async getAvailableBatches(
    businessId: string,
    productId: string
  ) {
    return productBatchRepository.findAvailableBatches(
      businessId,
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