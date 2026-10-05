import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { categories as productCategories } from "@/db/schema/inventory/categories";
import { products } from "@/db/schema/inventory/products";

import { productService } from "@/features/inventory/services";
import { productPriceService } from "@/features/inventory/services/product-prices.service";
import { assertValidFactor } from "@/features/inventory/services/unit-conversion.service";
import { priceListRepository } from "@/repositories/inventory/price-lists.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { unitsRepository } from "@/repositories/settings/units.repository";

import {
  DEFAULT_INDUSTRY_STARTER_PRODUCTS,
  getIndustryStarterByCodes,
  listIndustryStarterByKit,
  type IndustryStarterKitId,
  type IndustryStarterProduct,
} from "../constants/industry-starters/default-industry-starters";
import {
  filterKitsList,
  resolveIndustryKitsForBusinessType,
} from "../constants/industry-starters/kit-by-business-type";

async function ensureProductCategory(
  businessId: string,
  name: string,
): Promise<string> {
  const existing = await db.query.categories.findFirst({
    where: and(
      eq(productCategories.businessId, businessId),
      eq(productCategories.name, name),
    ),
  });
  if (existing) return existing.id;
  const [row] = await db
    .insert(productCategories)
    .values({
      businessId,
      name,
      description: "Auto-created from industry starter kit",
      active: true,
    })
    .returning({ id: productCategories.id });
  return row.id;
}

async function resolveUnitId(
  businessId: string,
  code: string,
): Promise<string | null> {
  const u = await unitsRepository.findByCode(code, businessId);
  return u?.id ?? null;
}

/** Ensure common units exist for industry kits (PCS, BOX, BAG, KG, …). */
async function ensureCommonUnits(businessId: string) {
  const needed = [
    { code: "PCS", name: "Pieces" },
    { code: "BOX", name: "Box" },
    { code: "BAG", name: "Bag" },
    { code: "KG", name: "Kilogram" },
    { code: "M", name: "Metre" },
    { code: "FT", name: "Foot" },
    { code: "TON", name: "Tonne" },
    { code: "BOT", name: "Bottle" },
    { code: "LTR", name: "Litre" },
  ];
  for (const u of needed) {
    const existing = await unitsRepository.findByCode(u.code, businessId);
    if (existing) continue;
    try {
      await unitsRepository.create({
        businessId,
        code: u.code,
        name: u.name,
        active: true,
      });
    } catch {
      // unit may already exist under another shape — ignore
    }
  }
}

export function listIndustryStarterTemplates(
  kit?: IndustryStarterKitId,
  allowedKits?: IndustryStarterKitId[] | "all",
) {
  let list = kit
    ? listIndustryStarterByKit(kit)
    : DEFAULT_INDUSTRY_STARTER_PRODUCTS;

  if (allowedKits && allowedKits !== "all") {
    const set = new Set(allowedKits);
    list = list.filter((p) => set.has(p.kit));
  }

  return list.map((p) => ({
    kit: p.kit,
    code: p.code,
    name: p.name,
    sku: p.sku,
    categoryName: p.categoryName,
    serialized: Boolean(p.serialized),
    suggestedCost: p.suggestedCost ?? null,
    suggestedSell: p.suggestedSell ?? null,
    description: p.description ?? null,
  }));
}

export async function listIndustryStarterStatusForBusiness(
  businessId: string,
  kit?: IndustryStarterKitId,
  options?: { businessType?: string | null },
) {
  const resolved = resolveIndustryKitsForBusinessType(
    options?.businessType ?? null,
  );
  const allowedKits =
    resolved === "pharmacy-only"
      ? ([] as IndustryStarterKitId[])
      : filterKitsList(resolved);

  const templates = listIndustryStarterTemplates(
    kit,
    resolved === "all" ? "all" : allowedKits,
  );
  const existing = await db.query.products.findMany({
    where: eq(products.businessId, businessId),
    columns: { sku: true },
  });
  const skuSet = new Set(
    existing
      .map((p) => (p.sku ?? "").toUpperCase())
      .filter(Boolean),
  );
  return templates.map((t) => ({
    ...t,
    alreadyInCatalogue: skuSet.has(t.sku.toUpperCase()),
  }));
}

export function getStarterKitModeForBusinessType(
  businessType: string | null | undefined,
) {
  const resolved = resolveIndustryKitsForBusinessType(businessType);
  return {
    mode: resolved,
    allowedKits: filterKitsList(resolved),
    isPharmacyOnly: resolved === "pharmacy-only",
    showAllIndustryKits: resolved === "all",
  };
}

export async function addIndustryStarterProductsForBusiness(
  businessId: string,
  codes: string[],
): Promise<{
  created: number;
  skipped: number;
  failed: number;
  results: Array<{
    code: string;
    status: "created" | "skipped" | "failed";
    message: string;
  }>;
}> {
  await ensureCommonUnits(businessId);

  const selected =
    codes.length === 0
      ? DEFAULT_INDUSTRY_STARTER_PRODUCTS
      : getIndustryStarterByCodes(codes);

  const defaultList = await priceListRepository.findDefault(businessId);
  const results: Array<{
    code: string;
    status: "created" | "skipped" | "failed";
    message: string;
  }> = [];
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const tpl of selected) {
    try {
      const skuExists = tpl.sku
        ? await db.query.products.findFirst({
            where: and(
              eq(products.businessId, businessId),
              eq(products.sku, tpl.sku),
            ),
          })
        : null;
      if (skuExists) {
        skipped++;
        results.push({
          code: tpl.code,
          status: "skipped",
          message: `SKU ${tpl.sku} already exists.`,
        });
        continue;
      }

      const categoryId = await ensureProductCategory(
        businessId,
        tpl.categoryName,
      );
      const stockUnitId = await resolveUnitId(businessId, tpl.stockUnitCode);
      const salesUnitId = await resolveUnitId(businessId, tpl.salesUnitCode);
      const purchaseUnitId = await resolveUnitId(
        businessId,
        tpl.purchaseUnitCode,
      );

      if (!stockUnitId) {
        failed++;
        results.push({
          code: tpl.code,
          status: "failed",
          message: `Unit "${tpl.stockUnitCode}" not found. Add it under Settings → Units.`,
        });
        continue;
      }

      const product = await productService.createProduct({
        businessId,
        productType: "physical",
        categoryId,
        supplierId: null,
        manufacturerId: null,
        drugCategoryId: null,
        dosageFormId: null,
        drugStrengthId: null,
        prescriptionTypeId: null,
        purchaseUnitId: purchaseUnitId ?? stockUnitId,
        salesUnitId: salesUnitId ?? stockUnitId,
        stockUnitId,
        incomeAccountId: null,
        expenseAccountId: null,
        inventoryAccountId: null,
        taxRateId: null,
        name: tpl.name,
        genericName: null,
        productBrand: tpl.productBrand ?? null,
        description: tpl.description ?? null,
        sku: tpl.sku,
        barcode: tpl.barcode ?? null,
        packSize: null,
        costPrice: tpl.suggestedCost ?? null,
        trackInventory: true,
        trackBatch: Boolean(tpl.trackBatch),
        trackExpiry: Boolean(tpl.trackExpiry),
        serialized: Boolean(tpl.serialized),
        allowNegativeStock: false,
        minimumStock: tpl.minimumStock ?? 0,
        reorderLevel: tpl.reorderLevel ?? 0,
        active: true,
      });

      if (tpl.boxFactor && tpl.boxFactor > 1) {
        const boxId = await resolveUnitId(businessId, "BOX");
        if (boxId && boxId !== stockUnitId) {
          try {
            assertValidFactor(tpl.boxFactor);
            await productUnitRepository.createMany([
              {
                businessId,
                productId: product.id,
                unitId: boxId,
                factorToStock: String(tpl.boxFactor),
                isStockUnit: false,
                isPurchaseDefault: true,
                isSalesDefault: false,
                allowPurchase: true,
                allowSale: true,
                active: true,
              },
            ]);
          } catch {
            // packaging optional
          }
        }
      }

      if (
        defaultList &&
        tpl.suggestedSell != null &&
        Number.isFinite(tpl.suggestedSell) &&
        tpl.suggestedSell > 0
      ) {
        try {
          await productPriceService.createProductPrice({
            businessId,
            productId: product.id,
            priceListId: defaultList.id,
            unitId: salesUnitId ?? stockUnitId,
            price: Number(tpl.suggestedSell).toFixed(2),
            minimumQuantity: "1",
            active: true,
          });
        } catch {
          // price optional if list shape differs
        }
      }

      created++;
      results.push({
        code: tpl.code,
        status: "created",
        message: "Product master created.",
      });
    } catch (e) {
      failed++;
      results.push({
        code: tpl.code,
        status: "failed",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return { created, skipped, failed, results };
}

export type { IndustryStarterProduct, IndustryStarterKitId };
