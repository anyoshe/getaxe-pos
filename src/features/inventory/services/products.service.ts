import { productRepository } from "@/repositories/inventory/products.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";

import type { CreateProductInput } from "../schemas/products";

export class ProductService {
  async getProducts(businessId: string) {
    return productRepository.findAll(businessId);
  }

  async getProduct(id: string, businessId: string) {
    const product = await productRepository.findById(id, businessId);

    if (!product) {
      throw new Error("Product not found.");
    }

    return product;
  }

  async createProduct(
    data: CreateProductInput & {
      businessId: string;
    },
  ) {
    if (data.sku) {
      const skuExists = await productRepository.existsBySku(
        data.businessId,
        data.sku,
      );

      if (skuExists) {
        throw new Error("Product SKU already exists.");
      }
    }

    if (data.barcode) {
      const barcodeExists = await productRepository.existsByBarcode(
        data.businessId,
        data.barcode,
      );

      if (barcodeExists) {
        throw new Error("Product barcode already exists.");
      }
    }

    const product = await productRepository.create(data);

    // Seed product_units from product unit FKs (factor 1 each).
    const byUnit = new Map<
      string,
      {
        businessId: string;
        productId: string;
        unitId: string;
        factorToStock: string;
        isStockUnit: boolean;
        isPurchaseDefault: boolean;
        isSalesDefault: boolean;
        allowPurchase: boolean;
        allowSale: boolean;
        active: boolean;
      }
    >();

    const ensure = (
      unitId: string | null | undefined,
      flags: {
        isStockUnit?: boolean;
        isPurchaseDefault?: boolean;
        isSalesDefault?: boolean;
      },
    ) => {
      if (!unitId) return;
      const prev = byUnit.get(unitId);
      if (!prev) {
        byUnit.set(unitId, {
          businessId: data.businessId,
          productId: product.id,
          unitId,
          factorToStock: "1",
          isStockUnit: Boolean(flags.isStockUnit),
          isPurchaseDefault: Boolean(flags.isPurchaseDefault),
          isSalesDefault: Boolean(flags.isSalesDefault),
          allowPurchase: true,
          allowSale: true,
          active: true,
        });
      } else {
        prev.isStockUnit = prev.isStockUnit || Boolean(flags.isStockUnit);
        prev.isPurchaseDefault =
          prev.isPurchaseDefault || Boolean(flags.isPurchaseDefault);
        prev.isSalesDefault =
          prev.isSalesDefault || Boolean(flags.isSalesDefault);
      }
    };

    ensure(data.stockUnitId, { isStockUnit: true });
    ensure(data.purchaseUnitId, { isPurchaseDefault: true });
    ensure(data.salesUnitId, { isSalesDefault: true });

    if (byUnit.size > 0) {
      try {
        await productUnitRepository.createMany([...byUnit.values()]);
      } catch {
        // Table may not exist until migration runs
      }
    }

    return product;
  }

  async updateProduct(
    id: string,
    data: Partial<CreateProductInput>,
    businessId: string,
  ) {
    const existing = await productRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Product not found.");
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await productRepository.existsBySku(
        existing.businessId,
        data.sku,
      );

      if (skuExists) {
        throw new Error("Product SKU already exists.");
      }
    }

    if (data.barcode && data.barcode !== existing.barcode) {
      const barcodeExists = await productRepository.existsByBarcode(
        existing.businessId,
        data.barcode,
      );

      if (barcodeExists) {
        throw new Error("Product barcode already exists.");
      }
    }

    return productRepository.update(id, businessId, data);
  }

  async deleteProduct(id: string, businessId: string) {
    const existing = await productRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Product not found.");
    }

    return productRepository.deactivate(id, businessId);
  }

  async activateProduct(id: string, businessId: string) {
    const existing = await productRepository.findById(id, businessId);

    if (!existing) {
      throw new Error("Product not found.");
    }

    return productRepository.update(id, businessId, {
      active: true,
    });
  }
}

export const productService = new ProductService();
