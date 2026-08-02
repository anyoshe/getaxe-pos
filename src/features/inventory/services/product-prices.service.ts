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
        id: string
    ) {
        const productPrice =
            await productPriceRepository.findById(id);

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
        data: Partial<ProductPriceInsert>
    ) {
        const existing =
            await productPriceRepository.findById(id);

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

        if (
            productId !== existing.productId ||
            priceListId !== existing.priceListId ||
            minimumQuantity !==
            existing.minimumQuantity
        ) {
            const exists =
                await productPriceRepository.exists(
                    existing.businessId,
                    productId,
                    priceListId,
                    minimumQuantity
                );

            if (exists) {
                throw new Error(
                    "A price already exists for this product, price list and minimum quantity."
                );
            }
        }

        return productPriceRepository.update(
            id,
            data
        );
    }

    async deleteProductPrice(
        id: string
    ) {
        const existing =
            await productPriceRepository.findById(id);

        if (!existing) {
            throw new Error(
                "Product price not found."
            );
        }

        return productPriceRepository.deactivate(
            id
        );
    }
}

export const productPriceService =
    new ProductPriceService();