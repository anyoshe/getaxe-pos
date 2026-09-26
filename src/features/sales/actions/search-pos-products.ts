"use server";

import { and, asc, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { productService } from "@/features/inventory/services";
import { db } from "@/db";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productSerials } from "@/db/schema/inventory/product_serials";
import { productBatches } from "@/db/schema/inventory/product_batches";
import { productUnits } from "@/db/schema/inventory/product_units";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { priceLists } from "@/db/schema/inventory/price_lists";
import { units } from "@/db/schema/settings/units";

type PosProductDto = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  productType: string;
  categoryId: string | null;
  categoryName: string | null;
  trackInventory: boolean;
  trackBatch: boolean;
  trackExpiry: boolean;
  serialized: boolean;
  isControlled: boolean;
  salesUnitId: string | null;
  stockUnitId: string | null;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  sellingPrice: number;
  active: boolean;
};

function mapPosProduct(p: Record<string, unknown>): PosProductDto {
  const cat = p.category as { name?: string } | null | undefined;
  return {
    id: String(p.id),
    name: String(p.name),
    sku: (p.sku as string | null) ?? null,
    barcode: (p.barcode as string | null) ?? null,
    productType: String(p.productType ?? "physical"),
    categoryId: (p.categoryId as string | null) ?? null,
    categoryName: cat?.name ?? null,
    trackInventory: p.trackInventory !== false,
    trackBatch: Boolean(p.trackBatch),
    trackExpiry: Boolean(p.trackExpiry),
    serialized: Boolean(p.serialized),
    isControlled: Boolean(p.isControlled),
    salesUnitId: (p.salesUnitId as string | null) ?? null,
    stockUnitId: (p.stockUnitId as string | null) ?? null,
    costPrice: p.costPrice != null ? Number(p.costPrice) : 0,
    retailPrice: Number(p.retailPrice ?? 0),
    wholesalePrice: Number(p.wholesalePrice ?? 0),
    sellingPrice: Number(p.sellingPrice ?? p.retailPrice ?? 0),
    active: p.active !== false,
  };
}

export async function searchPosProductsAction(input: {
  query: string;
  limit?: number;
}) {
  const user = await requireCurrentUser();
  const q = (input.query ?? "").trim();
  if (q.length < 1) {
    return {
      success: true as const,
      products: [] as PosProductDto[],
      support: await loadPosSupport(user.businessId, []),
    };
  }

  const limit = Math.min(40, Math.max(5, input.limit ?? 24));
  const rows = await productService.getProductsForPos(user.businessId, {
    search: q,
    limit,
  });
  const products = (rows as Record<string, unknown>[]).map(mapPosProduct);
  const support = await loadPosSupport(
    user.businessId,
    products.map((p) => p.id),
  );

  return { success: true as const, products, support };
}

export async function loadPosSupport(businessId: string, productIds: string[]) {
  const empty = {
    stockByProductWarehouse: {} as Record<string, Record<string, number>>,
    serialsByProduct: {} as Record<
      string,
      { id: string; serialNumber: string; warehouseId: string | null }[]
    >,
    batchesByProductWarehouse: {} as Record<
      string,
      Record<
        string,
        {
          batchId: string;
          batchNumber: string;
          expiryDate: string | null;
          manufactureDate: string | null;
          quantity: number;
        }[]
      >
    >,
    productUnitsByProduct: {} as Record<
      string,
      {
        unitId: string;
        factorToStock: number;
        isSalesDefault: boolean;
        isStockUnit: boolean;
        allowSale: boolean;
        unitCode: string | null;
        unitName: string | null;
        label: string;
      }[]
    >,
    unitPricesByProduct: {} as Record<string, Record<string, number>>,
  };

  if (productIds.length === 0) return empty;

  const [balanceRows, serialRows, batchRows, unitRows, priceRows] =
    await Promise.all([
      db
        .select({
          productId: inventoryBalances.productId,
          warehouseId: inventoryBalances.warehouseId,
          quantity: sql<string>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
        })
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.businessId, businessId),
            inArray(inventoryBalances.productId, productIds),
          ),
        )
        .groupBy(inventoryBalances.productId, inventoryBalances.warehouseId),
      db
        .select({
          id: productSerials.id,
          productId: productSerials.productId,
          warehouseId: productSerials.warehouseId,
          serialNumber: productSerials.serialNumber,
        })
        .from(productSerials)
        .where(
          and(
            eq(productSerials.businessId, businessId),
            eq(productSerials.status, "AVAILABLE"),
            inArray(productSerials.productId, productIds),
          ),
        ),
      db
        .select({
          productId: inventoryBalances.productId,
          warehouseId: inventoryBalances.warehouseId,
          batchId: inventoryBalances.batchId,
          quantity: inventoryBalances.quantity,
          batchNumber: productBatches.batchNumber,
          expiryDate: productBatches.expiryDate,
          manufactureDate: productBatches.manufactureDate,
        })
        .from(inventoryBalances)
        .innerJoin(
          productBatches,
          eq(inventoryBalances.batchId, productBatches.id),
        )
        .where(
          and(
            eq(inventoryBalances.businessId, businessId),
            inArray(inventoryBalances.productId, productIds),
            gt(inventoryBalances.quantity, "0"),
            eq(productBatches.active, true),
          ),
        )
        .orderBy(asc(productBatches.expiryDate)),
      db
        .select({
          productId: productUnits.productId,
          unitId: productUnits.unitId,
          factorToStock: productUnits.factorToStock,
          isSalesDefault: productUnits.isSalesDefault,
          isStockUnit: productUnits.isStockUnit,
          allowSale: productUnits.allowSale,
          unitCode: units.code,
          unitName: units.name,
        })
        .from(productUnits)
        .innerJoin(units, eq(productUnits.unitId, units.id))
        .where(
          and(
            eq(productUnits.businessId, businessId),
            eq(productUnits.active, true),
            isNull(productUnits.validTo),
            inArray(productUnits.productId, productIds),
            or(
              eq(productUnits.allowSale, true),
              eq(productUnits.isStockUnit, true),
            ),
          ),
        ),
      db
        .select({
          productId: productPrices.productId,
          unitId: productPrices.unitId,
          price: productPrices.price,
          isDefault: priceLists.isDefault,
          listCode: priceLists.code,
          listName: priceLists.name,
        })
        .from(productPrices)
        .innerJoin(priceLists, eq(productPrices.priceListId, priceLists.id))
        .where(
          and(
            eq(productPrices.businessId, businessId),
            eq(productPrices.active, true),
            eq(priceLists.active, true),
            inArray(productPrices.productId, productIds),
          ),
        ),
    ]);

  for (const row of balanceRows) {
    const byW = empty.stockByProductWarehouse[row.productId] ?? {};
    byW[row.warehouseId] = Number(row.quantity) || 0;
    empty.stockByProductWarehouse[row.productId] = byW;
  }

  for (const row of serialRows) {
    const list = empty.serialsByProduct[row.productId] ?? [];
    list.push({
      id: row.id,
      serialNumber: row.serialNumber,
      warehouseId: row.warehouseId,
    });
    empty.serialsByProduct[row.productId] = list;
  }

  for (const row of batchRows) {
    if (!row.batchId) continue;
    const byWh = empty.batchesByProductWarehouse[row.productId] ?? {};
    const list = byWh[row.warehouseId] ?? [];
    list.push({
      batchId: row.batchId,
      batchNumber: row.batchNumber ?? "",
      expiryDate: row.expiryDate ? String(row.expiryDate).slice(0, 10) : null,
      manufactureDate: row.manufactureDate
        ? String(row.manufactureDate).slice(0, 10)
        : null,
      quantity: Number(row.quantity) || 0,
    });
    byWh[row.warehouseId] = list;
    empty.batchesByProductWarehouse[row.productId] = byWh;
  }

  for (const row of unitRows) {
    const list = empty.productUnitsByProduct[row.productId] ?? [];
    list.push({
      unitId: row.unitId,
      factorToStock: Number(row.factorToStock) || 1,
      isSalesDefault: Boolean(row.isSalesDefault),
      isStockUnit: Boolean(row.isStockUnit),
      allowSale: Boolean(row.allowSale),
      unitCode: row.unitCode,
      unitName: row.unitName,
      label: row.unitName || row.unitCode || "Unit",
    });
    empty.productUnitsByProduct[row.productId] = list;
  }

  const retailPriceRows = priceRows.filter((row) => {
    const code = (row.listCode ?? "").toLowerCase();
    const name = (row.listName ?? "").toLowerCase();
    return !(/wholesale|ws|trade/.test(code) || /wholesale|trade/.test(name));
  });
  const ranked = [...retailPriceRows].sort((a, b) => {
    const ad = a.isDefault ? 0 : 1;
    const bd = b.isDefault ? 0 : 1;
    return ad - bd;
  });
  for (const row of ranked) {
    if (!row.unitId) continue;
    const byU = empty.unitPricesByProduct[row.productId] ?? {};
    if (byU[row.unitId] != null) continue;
    byU[row.unitId] = Number(row.price) || 0;
    empty.unitPricesByProduct[row.productId] = byU;
  }

  return empty;
}
