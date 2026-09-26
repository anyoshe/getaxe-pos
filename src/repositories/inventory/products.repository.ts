import { and, asc, eq, ilike, inArray, or, sql } from "drizzle-orm";
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
  async findAllForPos(
    businessId: string,
    options?: { search?: string; limit?: number; offset?: number },
  ) {
    const search = options?.search?.trim() ?? "";
    const limit = options?.limit;
    const offset = options?.offset ?? 0;

    const conditions = [
      eq(products.businessId, businessId),
      eq(products.active, true),
    ];
    if (search) {
      const pattern = `%${search.replace(/[%_]/g, "")}%`;
      conditions.push(
        or(
          ilike(products.name, pattern),
          ilike(products.sku, pattern),
          ilike(products.barcode, pattern),
        )!,
      );
    }

    const rows = await this.database.query.products.findMany({
      where: and(...conditions),
      columns: {
        id: true,
        businessId: true,
        name: true,
        sku: true,
        barcode: true,
        productType: true,
        costPrice: true,
        lastPurchaseCost: true,
        markupPercent: true,
        trackInventory: true,
        trackBatch: true,
        trackExpiry: true,
        serialized: true,
        isControlled: true,
        salesUnitId: true,
        stockUnitId: true,
        purchaseUnitId: true,
        categoryId: true,
        active: true,
      },
      with: {
        category: {
          columns: { id: true, name: true, markupPercent: true },
        },
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
      ...(limit != null && limit > 0
        ? { limit, offset: Math.max(0, offset) }
        : {}),
    });

    const productIds = rows.map((r) => r.id);
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
              priceListId: productPrices.priceListId,
              unitId: productPrices.unitId,
            })
            .from(productPrices)
            .where(
              and(
                eq(productPrices.businessId, businessId),
                eq(productPrices.active, true),
                inArray(productPrices.productId, productIds),
              ),
            );

    const byProduct = new Map<string, typeof priceRows>();
    for (const row of priceRows) {
      const list = byProduct.get(row.productId) ?? [];
      list.push(row);
      byProduct.set(row.productId, list);
    }

    return rows.map((r) => {
      const domain = toDomainProduct(
        r as typeof r & {
          costPrice: string | null;
          lastPurchaseCost?: string | null;
          markupPercent?: string | null;
        },
      );
      const sorted = [...(byProduct.get(r.id) ?? [])].sort(
        (a, b) => Number(a.minimumQuantity) - Number(b.minimumQuantity),
      );
      const pickFromList = (listId: string | undefined) => {
        if (!listId) return null;
        const forList = sorted.filter((p) => p.priceListId === listId);
        return (
          forList.find((p) => Number(p.minimumQuantity) <= 1) ??
          forList[0] ??
          null
        );
      };
      const retailRow =
        pickFromList(defaultList?.id) ??
        sorted.find((p) => Number(p.minimumQuantity) <= 1) ??
        sorted[0] ??
        null;
      const wholesaleRow = pickFromList(wholesaleList?.id);

      let retailPrice = retailRow ? Number(retailRow.price) : null;
      let wholesalePrice = wholesaleRow
        ? Number(wholesaleRow.price)
        : null;

      const cost = domain.costPrice != null ? Number(domain.costPrice) : 0;
      const prodM =
        domain.markupPercent != null ? Number(domain.markupPercent) : null;
      const catM =
        r.category?.markupPercent != null
          ? Number(r.category.markupPercent)
          : null;
      const markup =
        prodM != null && Number.isFinite(prodM)
          ? prodM
          : catM != null && Number.isFinite(catM)
            ? catM
            : null;
      const suggested =
        cost > 0 && markup != null
          ? Math.round(cost * (1 + markup / 100) * 100) / 100
          : null;

      if (!(retailPrice != null && Number.isFinite(retailPrice) && retailPrice > 0)) {
        retailPrice = suggested;
      }
      if (!(wholesalePrice != null && Number.isFinite(wholesalePrice) && wholesalePrice > 0)) {
        wholesalePrice = retailPrice;
      }

      return {
        ...domain,
        category: r.category
          ? {
              id: r.category.id,
              name: r.category.name,
              markupPercent: r.category.markupPercent,
            }
          : null,
        sellingPrice: retailPrice,
        retailPrice,
        wholesalePrice,
        costPrice: domain.costPrice,
      };
    });
  }

  /** Paged product catalogue for inventory UI */
  async findPage(
    businessId: string,
    options?: { search?: string; page?: number; pageSize?: number },
  ) {
    const search = options?.search?.trim() ?? "";
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.min(100, Math.max(10, options?.pageSize ?? 40));
    const offset = (page - 1) * pageSize;

    const conditions = [eq(products.businessId, businessId)];
    if (search) {
      const pattern = `%${search.replace(/[%_]/g, "")}%`;
      conditions.push(
        or(
          ilike(products.name, pattern),
          ilike(products.sku, pattern),
          ilike(products.barcode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [countRow] = await this.database
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(whereClause);

    const total = Number(countRow?.count ?? 0);

    const rows = await this.database.query.products.findMany({
      where: whereClause,
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
      limit: pageSize,
      offset,
    });

    // Attach retail prices like findAll
    const productIds = rows.map((r) => r.id);
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
              priceListId: productPrices.priceListId,
              unitId: productPrices.unitId,
            })
            .from(productPrices)
            .where(
              and(
                eq(productPrices.businessId, businessId),
                eq(productPrices.active, true),
                inArray(productPrices.productId, productIds),
              ),
            );

    const byProduct = new Map<string, typeof priceRows>();
    for (const row of priceRows) {
      const list = byProduct.get(row.productId) ?? [];
      list.push(row);
      byProduct.set(row.productId, list);
    }

    const items = rows.map((r) => {
      const domain = toDomainProduct(r as typeof r & { costPrice: string | null });
      const sorted = [...(byProduct.get(r.id) ?? [])].sort(
        (a, b) => Number(a.minimumQuantity) - Number(b.minimumQuantity),
      );
      const pickFromList = (listId: string | undefined) => {
        if (!listId) return null;
        const forList = sorted.filter((p) => p.priceListId === listId);
        return (
          forList.find((p) => Number(p.minimumQuantity) <= 1) ??
          forList[0] ??
          null
        );
      };
      const retailRow =
        pickFromList(defaultList?.id) ??
        sorted.find((p) => Number(p.minimumQuantity) <= 1) ??
        sorted[0] ??
        null;
      const wholesaleRow = pickFromList(wholesaleList?.id);
      let retailPrice = retailRow ? Number(retailRow.price) : null;
      let wholesalePrice = wholesaleRow ? Number(wholesaleRow.price) : null;
      const cost = domain.costPrice != null ? Number(domain.costPrice) : 0;
      if (!(retailPrice != null && retailPrice > 0) && cost > 0) {
        // leave null — list UI shows cost separately
      }
      return {
        ...domain,
        category: r.category,
        supplier: r.supplier,
        purchaseUnit: r.purchaseUnit,
        salesUnit: r.salesUnit,
        stockUnit: r.stockUnit,
        manufacturer: r.manufacturer,
        drugCategory: r.drugCategory,
        dosageForm: r.dosageForm,
        drugStrength: r.drugStrength,
        prescriptionType: r.prescriptionType,
        incomeAccount: r.incomeAccount,
        expenseAccount: r.expenseAccount,
        inventoryAccount: r.inventoryAccount,
        taxRate: r.taxRate,
        sellingPrice: retailPrice,
        retailPrice,
        wholesalePrice,
      };
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
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
