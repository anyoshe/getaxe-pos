import { productRepository } from "@/repositories/inventory/products.repository";

import type {
    CreateProductInput,
} from "../schemas/products";

export class ProductService {

    async getProducts(
        businessId: string
    ) {
        return productRepository.findAll(
            businessId
        );
    }

    async getProduct(
        id: string
    ) {
        const product =
            await productRepository.findById(id);

        if (!product) {
            throw new Error(
                "Product not found."
            );
        }

        return product;
    }

    async createProduct(
    data: CreateProductInput & {
        businessId: string;
    }
) {
        if (data.sku) {
            const skuExists =
                await productRepository.existsBySku(
                    data.businessId,
                    data.sku
                );

            if (skuExists) {
                throw new Error(
                    "Product SKU already exists."
                );
            }
        }


        if (data.barcode) {
            const barcodeExists =
                await productRepository.existsByBarcode(
                    data.businessId,
                    data.barcode
                );

            if (barcodeExists) {
                throw new Error(
                    "Product barcode already exists."
                );
            }
        }


        return productRepository.create(
            data
        );
    }

   async updateProduct(
    id: string,
    data: Partial<CreateProductInput>
) {
        const existing =
            await productRepository.findById(id);

        if (!existing) {
            throw new Error(
                "Product not found."
            );
        }


        if (
            data.sku &&
            data.sku !== existing.sku
        ) {
            const skuExists =
                await productRepository.existsBySku(
                    existing.businessId,
                    data.sku
                );

            if (skuExists) {
                throw new Error(
                    "Product SKU already exists."
                );
            }
        }


        if (
            data.barcode &&
            data.barcode !== existing.barcode
        ) {
            const barcodeExists =
                await productRepository.existsByBarcode(
                    existing.businessId,
                    data.barcode
                );

            if (barcodeExists) {
                throw new Error(
                    "Product barcode already exists."
                );
            }
        }


        return productRepository.update(
            id,
            data
        );
    }

    async deleteProduct(
        id: string
    ) {
        const existing =
            await productRepository.findById(id);

        if (!existing) {
            throw new Error(
                "Product not found."
            );
        }

        return productRepository.deactivate(
            id
        );
    }

    async activateProduct(
        id: string
    ) {
        const existing =
            await productRepository.findById(id);

        if (!existing) {
            throw new Error(
                "Product not found."
            );
        }

        return productRepository.update(
            id,
            {
                active: true,
            }
        );
    }

}

export const productService =
    new ProductService();