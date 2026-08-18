import { and, asc, eq, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { products } from "@/db/schema/inventory/products";

import { BaseRepository } from "../base";

type DatabaseProductInsert = InferInsertModel<typeof products>;

export type ProductInsert = Omit<DatabaseProductInsert, "costPrice"> & {
  costPrice?: number | null;
};

function toDomainProduct<
  T extends {
    costPrice: string | null;
  },
>(product: T) {
  return {
    ...product,
    costPrice: product.costPrice === null ? null : Number(product.costPrice),
  };
}

function toDatabaseInsert(data: ProductInsert): DatabaseProductInsert {
  return {
    ...data,
    costPrice: data.costPrice == null ? null : data.costPrice.toString(),
  };
}

function toDatabaseUpdate(
  data: Partial<ProductInsert>,
): Partial<DatabaseProductInsert> {
  return {
    ...data,
    costPrice:
      data.costPrice == null ? data.costPrice : data.costPrice.toString(),
  };
}

export class ProductRepository extends BaseRepository {
  async findAll(businessId: string) {
    const rows = await this.database.query.products.findMany({
      where: eq(products.businessId, businessId),

      with: {
        category: true,
        supplier: true,

        purchaseUnit: true,
        salesUnit: true,
        stockUnit: true,

        manufacturer: true,
        drugCategory: true,
        dosageForm: true,
        drugStrength: true,
        prescriptionType: true,

        incomeAccount: true,
        expenseAccount: true,
        inventoryAccount: true,

        taxRate: true,
      },

      orderBy: (table, { asc }) => [asc(table.name)],
    });

    return rows.map((r) => ({
      ...toDomainProduct(r),

      // Provide empty arrays for heavy aggregate relations that are loaded on demand
      prices: [],
      batches: [],
      stockMovements: [],
      inventoryBalances: [],
    }));
  }

  async findById(id: string, businessId: string) {
    const row = await this.database.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.businessId, businessId)),

      with: {
        category: true,
        supplier: true,

        purchaseUnit: true,
        salesUnit: true,
        stockUnit: true,

        manufacturer: true,
        drugCategory: true,
        dosageForm: true,
        drugStrength: true,
        prescriptionType: true,

        incomeAccount: true,
        expenseAccount: true,
        inventoryAccount: true,

        taxRate: true,

        prices: true,
        batches: true,
        stockMovements: true,
        inventoryBalances: true,
      },
    });

    return row ? toDomainProduct(row) : null;
  }

    async findForSelection(businessId: string) {
    return this.database
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        barcode: products.barcode,
      })
      .from(products)
      .where(
        and(
          eq(products.businessId, businessId),
          eq(products.active, true),
        ),
      )
      .orderBy(asc(products.name));
  }
  async create(data: ProductInsert) {
    const [product] = await this.database
      .insert(products)
      .values(toDatabaseInsert(data))
      .returning();

    return toDomainProduct(product);
  }

  async update(id: string, businessId: string, data: Partial<ProductInsert>) {
    const [product] = await this.database
      .update(products)
      .set(toDatabaseUpdate(data))
      .where(and(eq(products.id, id), eq(products.businessId, businessId)))
      .returning();

    return toDomainProduct(product);
  }

  async delete(id: string, businessId: string) {
    const [product] = await this.database
      .delete(products)
      .where(and(eq(products.id, id), eq(products.businessId, businessId)))
      .returning();

    return toDomainProduct(product);
  }

  async existsBySku(businessId: string, sku: string) {
    if (!sku) {
      return false;
    }

    const product = await this.database.query.products.findFirst({
      where: and(eq(products.businessId, businessId), eq(products.sku, sku)),
    });

    return !!product;
  }

  async existsByBarcode(businessId: string, barcode: string) {
    if (!barcode) {
      return false;
    }

    const product = await this.database.query.products.findFirst({
      where: and(
        eq(products.businessId, businessId),
        eq(products.barcode, barcode),
      ),
    });

    return !!product;
  }

  async deactivate(id: string, businessId: string) {
    const [product] = await this.database
      .update(products)
      .set({
        active: false,
      })
      .where(and(eq(products.id, id), eq(products.businessId, businessId)))
      .returning();

    return toDomainProduct(product);
  }

  async count(businessId: string) {
    const result = await this.database
      .select({
        count: sql<number>`count(*)`,
      })
      .from(products)
      .where(eq(products.businessId, businessId));

    return Number(result[0]?.count ?? 0);
  }
}

export const productRepository = new ProductRepository();
