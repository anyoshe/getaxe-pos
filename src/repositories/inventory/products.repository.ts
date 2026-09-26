import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { products } from "@/db/schema/inventory/products";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { priceLists } from "@/db/schema/inventory/price_lists";

import { BaseRepository } from "../base";

type DatabaseProductInsert = InferInsertModel<typeof products>;

export type ProductInsert = Omit<
  DatabaseProductInsert,
  "costPrice" | "lastPurchaseCost" | "markupPercent"
> & {
  costPrice?: number | null;
  lastPurchaseCost?: number | null;
  markupPercent?: number | null;
};

function numOrNull(v: string | number | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function toDomainProduct<
  T extends {
    costPrice: string | null;
    lastPurchaseCost?: string | null;
    markupPercent?: string | null;
  },
>(product: T) {
  return {
    ...product,
    costPrice: numOrNull(product.costPrice),
    lastPurchaseCost: numOrNull(product.lastPurchaseCost ?? null),
    markupPercent: numOrNull(product.markupPercent ?? null),
  };
}

function toDatabaseInsert(data: ProductInsert): DatabaseProductInsert {
  return {
    ...data,
    costPrice: data.costPrice == null ? null : data.costPrice.toString(),
    lastPurchaseCost:
      data.lastPurchaseCost == null ? null : data.lastPurchaseCost.toString(),
    markupPercent:
      data.markupPercent == null ? null : data.markupPercent.toString(),
  };
}

function toDatabaseUpdate(
  data: Partial<ProductInsert>,
): Partial<DatabaseProductInsert> {
  const out: Partial<DatabaseProductInsert> = { ...data } as Partial<DatabaseProductInsert>;
  if ("costPrice" in data) {
    out.costPrice =
      data.costPrice == null ? data.costPrice : data.costPrice.toString();
  }
  if ("lastPurchaseCost" in data) {
    out.lastPurchaseCost =
      data.lastPurchaseCost == null
        ? data.lastPurchaseCost
        : data.lastPurchaseCost.toString();
  }
  if ("markupPercent" in data) {
    out.markupPercent =
      data.markupPercent == null
        ? data.markupPercent
        : data.markupPercent.toString();
  }
  return out;
}

export class ProductRepository extends BaseRepository {
  /**
   * Lean product list for POS: active products only, minimal joins.
   * Full catalogue with accounts/pharmacy catalogues stays on findAll().
   */
  async findAllForPos(businessId: string) {
    const rows = await this.database.query.products.findMany({
      where: and(
        eq(products.businessId, businessId),
        eq(products.active, true),
      ),
      columns: {
        id: true,
        businessId: true,
        name: true,
        sku: true,
        barcode: true,
        productType: true,
        costPrice: true,
        trackInventory: true,
        trackBatch: true,
        trackExpiry: true,
        serialized: true,
        salesUnitId: true,
        stockUnitId: true,
        purchaseUnitId: true,
        categoryId: true,
        active: true,
      },
      with: {
        salesUnit: {
          columns: { id: true, code: true, name: true },
        },
        stockUnit: {
          columns: { id: true, code: true, name: true },
        },
        purchaseUnit: {
          columns: { id: true, code: true, name: true },
        },
      },
      orderBy: (table, { asc }) => [asc(table.name)],
    });

    return rows.map((r) => toDomainProduct(r as typeof r & { costPrice: string | null }));
  }

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

    const productIds = rows.map((r) => r.id);

    // Price lists: default = retail; match wholesale by code/name
    const allLists = await this.database.query.priceLists.findMany({
      where: and(
        eq(priceLists.businessId, businessId),
        eq(priceLists.active, true),
      ),
    });
    const defaultList =
      allLists.find((l) => l.isDefault) ?? allLists[0] ?? null;
    const wholesaleList =
      allLists.find(
        (l) =>
          /wholesale|ws|trade/i.test(l.code) ||
          /wholesale|trade/i.test(l.name),
      ) ?? null;

    const priceRows =
      productIds.length === 0
        ? []
        : await this.database
            .select({
              productId: productPrices.productId,
              price: productPrices.price,
              minimumQuantity: productPrices.minimumQuantity,
              active: productPrices.active,
              id: productPrices.id,
              businessId: productPrices.businessId,
              priceListId: productPrices.priceListId,
              createdAt: productPrices.createdAt,
              updatedAt: productPrices.updatedAt,
            })
            .from(productPrices)
            .where(
              and(
                eq(productPrices.businessId, businessId),
                eq(productPrices.active, true),
                inArray(productPrices.productId, productIds),
              ),
            );

    const pricesByProduct = new Map<string, typeof priceRows>();
    for (const row of priceRows) {
      const list = pricesByProduct.get(row.productId) ?? [];
      list.push(row);
      pricesByProduct.set(row.productId, list);
    }

    return rows.map((r) => {
      const productPriceRows = pricesByProduct.get(r.id) ?? [];

      // Retail / default list first, then lowest min-qty (shelf unit), never pick "cheapest" arbitrarily
      const sorted = [...productPriceRows].sort((a, b) => {
        if (defaultList) {
          const aDef = a.priceListId === defaultList.id ? 0 : 1;
          const bDef = b.priceListId === defaultList.id ? 0 : 1;
          if (aDef !== bDef) return aDef - bDef;
        }
        return Number(a.minimumQuantity) - Number(b.minimumQuantity);
      });

      const pickFromList = (listId: string | null | undefined) => {
        if (!listId) return null;
        return (
          sorted.find(
            (p) => p.priceListId === listId && Number(p.minimumQuantity) <= 1,
          ) ?? sorted.find((p) => p.priceListId === listId) ?? null
        );
      };

      const retailRow =
        pickFromList(defaultList?.id) ??
        sorted.find((p) => Number(p.minimumQuantity) <= 1) ??
        sorted[0] ??
        null;
      const wholesaleRow = pickFromList(wholesaleList?.id);

      const retailPrice = retailRow ? Number(retailRow.price) : null;
      const wholesalePrice = wholesaleRow
        ? Number(wholesaleRow.price)
        : retailPrice;
      const sellingPrice = retailPrice;

      return {
        ...toDomainProduct(r),
        prices: sorted,
        sellingPrice,
        retailPrice,
        wholesalePrice,
        batches: [],
        stockMovements: [],
        inventoryBalances: [],
      };
    });
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
        // Do not eager-load batches/movements/balances here:
        // products.batches relation is fragile under circular schema imports
        // and breaks receive / opening-stock (Drizzle infer error).
      },
    });

    if (!row) return null;
    return {
      ...toDomainProduct(row),
      batches: [],
      stockMovements: [],
      inventoryBalances: [],
    };
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

  async findByBarcode(businessId: string, barcode: string) {
    if (!barcode) {
      return null;
    }

    const row = await this.database.query.products.findFirst({
      where: and(
        eq(products.businessId, businessId),
        eq(products.barcode, barcode),
      ),
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
    });

    if (!row) {
      return null;
    }

    return {
      ...toDomainProduct(row),
      prices: [],
      batches: [],
      stockMovements: [],
      inventoryBalances: [],
    };
  }

  async findBySku(businessId: string, sku: string) {
    if (!sku) {
      return null;
    }

    const row = await this.database.query.products.findFirst({
      where: and(
        eq(products.businessId, businessId),
        eq(products.sku, sku),
      ),
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
    });

    if (!row) {
      return null;
    }

    return {
      ...toDomainProduct(row),
      prices: [],
      batches: [],
      stockMovements: [],
      inventoryBalances: [],
    };
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
