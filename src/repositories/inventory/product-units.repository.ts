import { and, eq, isNull, asc } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { productUnits } from "@/db/schema/inventory/product_units";
import { units } from "@/db/schema/settings/units";
import { BaseRepository } from "../base";

type ProductUnitInsert = InferInsertModel<typeof productUnits>;

export class ProductUnitRepository extends BaseRepository {
  async listByProduct(businessId: string, productId: string) {
    return this.database
      .select({
        id: productUnits.id,
        businessId: productUnits.businessId,
        productId: productUnits.productId,
        unitId: productUnits.unitId,
        factorToStock: productUnits.factorToStock,
        isStockUnit: productUnits.isStockUnit,
        isPurchaseDefault: productUnits.isPurchaseDefault,
        isSalesDefault: productUnits.isSalesDefault,
        allowPurchase: productUnits.allowPurchase,
        allowSale: productUnits.allowSale,
        active: productUnits.active,
        validFrom: productUnits.validFrom,
        validTo: productUnits.validTo,
        createdAt: productUnits.createdAt,
        unitName: units.name,
        unitCode: units.code,
        unitSymbol: units.symbol,
      })
      .from(productUnits)
      .leftJoin(units, eq(units.id, productUnits.unitId))
      .where(
        and(
          eq(productUnits.businessId, businessId),
          eq(productUnits.productId, productId),
          eq(productUnits.active, true),
          isNull(productUnits.validTo),
        ),
      )
      .orderBy(asc(productUnits.createdAt));
  }

  async create(data: ProductUnitInsert) {
    const [row] = await this.database
      .insert(productUnits)
      .values(data)
      .returning();
    return row;
  }

  async createMany(rows: ProductUnitInsert[]) {
    if (rows.length === 0) return [];
    return this.database.insert(productUnits).values(rows).returning();
  }

  /**
   * Close current factor and insert a new version (historical integrity).
   * Does not rewrite movements.
   */
  async supersedeFactor(params: {
    businessId: string;
    productId: string;
    unitId: string;
    newFactor: number;
    isStockUnit?: boolean;
    isPurchaseDefault?: boolean;
    isSalesDefault?: boolean;
    allowPurchase?: boolean;
    allowSale?: boolean;
  }) {
    const existing = await this.database
      .select()
      .from(productUnits)
      .where(
        and(
          eq(productUnits.businessId, params.businessId),
          eq(productUnits.productId, params.productId),
          eq(productUnits.unitId, params.unitId),
          isNull(productUnits.validTo),
        ),
      );

    const now = new Date();
    for (const row of existing) {
      await this.database
        .update(productUnits)
        .set({ validTo: now, active: false, updatedAt: now })
        .where(eq(productUnits.id, row.id));
    }

    const template = existing[0];
    return this.create({
      businessId: params.businessId,
      productId: params.productId,
      unitId: params.unitId,
      factorToStock: String(params.newFactor),
      isStockUnit: params.isStockUnit ?? template?.isStockUnit ?? false,
      isPurchaseDefault:
        params.isPurchaseDefault ?? template?.isPurchaseDefault ?? false,
      isSalesDefault: params.isSalesDefault ?? template?.isSalesDefault ?? false,
      allowPurchase: params.allowPurchase ?? template?.allowPurchase ?? true,
      allowSale: params.allowSale ?? template?.allowSale ?? true,
      active: true,
      validFrom: now,
      validTo: null,
    });
  }

  async updateFlags(params: {
    businessId: string;
    productId: string;
    unitId: string;
    isStockUnit?: boolean;
    isPurchaseDefault?: boolean;
    isSalesDefault?: boolean;
    allowPurchase?: boolean;
    allowSale?: boolean;
  }) {
    const now = new Date();
    await this.database
      .update(productUnits)
      .set({
        isStockUnit: params.isStockUnit,
        isPurchaseDefault: params.isPurchaseDefault,
        isSalesDefault: params.isSalesDefault,
        allowPurchase: params.allowPurchase,
        allowSale: params.allowSale,
        updatedAt: now,
      })
      .where(
        and(
          eq(productUnits.businessId, params.businessId),
          eq(productUnits.productId, params.productId),
          eq(productUnits.unitId, params.unitId),
          isNull(productUnits.validTo),
          eq(productUnits.active, true),
        ),
      );
  }
}

export const productUnitRepository = new ProductUnitRepository();
