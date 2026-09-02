import { productPriceRepository } from "@/repositories/inventory";

import type { InferInsertModel } from "drizzle-orm";

import { productPrices } from "@/db/schema/inventory/product_prices";

type ProductPriceInsert =
  InferInsertModel<typeof productPrices>;

export class ProductPriceService {

  async getProductPrices(
    businessId: string
  ) {
    return productPriceRepository.findAll(
      businessId
    );
  }

  async getProductPrice(
    id: string,
    businessId: string
  ) {
    const productPrice =
      await productPriceRepository.findById(
        id,
        businessId
      );

    if (!productPrice) {
      throw new Error(
        "Product price not found."
      );
    }

    return productPrice;
  }

  async createProductPrice(
    data: ProductPriceInsert
  ) {
    const minimumQuantity =
      data.minimumQuantity ?? "1";

    const exists =
      await productPriceRepository.exists(
        data.businessId,
        data.productId,
        data.priceListId,
        minimumQuantity
      );

    if (exists) {
      throw new Error(
        "A price already exists for this product, price list and minimum quantity."
      );
    }

    return productPriceRepository.create(
      data
    );
  }

  async updateProductPrice(
    id: string,
    data: Partial<ProductPriceInsert>,
    businessId: string
  ) {
    const existing =
      await productPriceRepository.findById(
        id,
        businessId
      );

    if (!existing) {
      throw new Error(
        "Product price not found."
      );
    }

    const productId =
      data.productId ??
      existing.productId;

    const priceListId =
      data.priceListId ??
      existing.priceListId;

    const minimumQuantity =
      data.minimumQuantity ??
      existing.minimumQuantity;

    // Only conflict if another row (not this id) shares product + list + min qty
    const minQtyStr = String(minimumQuantity);
    const exists = await productPriceRepository.exists(
      existing.businessId,
      productId,
      priceListId,
      minQtyStr,
      id,
    );

    if (exists) {
      throw new Error(
        "A price already exists for this product, price list and minimum quantity.",
      );
    }

    return productPriceRepository.update(id, businessId, {
      ...data,
      // normalize numeric strings for consistent storage
      price:
        data.price != null ? String(data.price) : undefined,
      minimumQuantity:
        data.minimumQuantity != null
          ? String(Number(data.minimumQuantity))
          : undefined,
    });
  }

  async deleteProductPrice(
    id: string,
    businessId: string
  ) {
    const existing =
      await productPriceRepository.findById(
        id,
        businessId
      );

    if (!existing) {
      throw new Error(
        "Product price not found."
      );
    }

    return productPriceRepository.deactivate(
      id,
      businessId
    );
  }
}

export const productPriceService =
  new ProductPriceService();