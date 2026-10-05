import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  dosageForms,
  drugCategories,
  drugStrengths,
  prescriptionTypes,
} from "@/db/schema/pharmacy";
import { categories as productCategories } from "@/db/schema/inventory/categories";
import { products } from "@/db/schema/inventory/products";

import { productService } from "@/features/inventory/services";
import { productPriceService } from "@/features/inventory/services/product-prices.service";
import { priceListRepository } from "@/repositories/inventory/price-lists.repository";
import { productUnitRepository } from "@/repositories/inventory/product-units.repository";
import { unitsRepository } from "@/repositories/settings/units.repository";
import { assertValidFactor } from "@/features/inventory/services/unit-conversion.service";

import { seedPharmacyCataloguesForBusiness } from "./seed-pharmacy-catalogues.service";
import {
  DEFAULT_PHARMACY_STARTER_PRODUCTS,
  getPharmacyStarterByCodes,
  type PharmacyStarterProduct,
} from "../constants/default-starter-products";

function strengthCode(label: string): string {
  return label.replace(/\s+/g, "").toUpperCase();
}

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
      description: "Auto-created from pharmacy starter list",
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

async function resolveDosageFormId(
  businessId: string,
  code: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: dosageForms.id })
    .from(dosageForms)
    .where(
      and(
        eq(dosageForms.businessId, businessId),
        eq(dosageForms.code, code),
      ),
    )
    .limit(1);
  return rows[0]?.id ?? null;
}

async function resolveDrugCategoryId(
  businessId: string,
  code: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: drugCategories.id })
    .from(drugCategories)
    .where(
      and(
        eq(drugCategories.businessId, businessId),
        eq(drugCategories.code, code),
      ),
    )
    .limit(1);
  return rows[0]?.id ?? null;
}

async function resolveStrengthId(
  businessId: string,
  label: string,
): Promise<string | null> {
  const code = strengthCode(label);
  const byCode = await db
    .select({ id: drugStrengths.id })
    .from(drugStrengths)
    .where(
      and(
        eq(drugStrengths.businessId, businessId),
        eq(drugStrengths.code, code),
      ),
    )
    .limit(1);
  if (byCode[0]) return byCode[0].id;

  const [created] = await db
    .insert(drugStrengths)
    .values({
      businessId,
      code,
      name: label,
      active: true,
    })
    .returning({ id: drugStrengths.id });
  return created?.id ?? null;
}

async function resolveRxTypeId(
  businessId: string,
  code: string,
): Promise<string | null> {
  const rows = await db
    .select({ id: prescriptionTypes.id })
    .from(prescriptionTypes)
    .where(
      and(
        eq(prescriptionTypes.businessId, businessId),
        eq(prescriptionTypes.code, code),
      ),
    )
    .limit(1);
  return rows[0]?.id ?? null;
}

function isConsumable(tpl: PharmacyStarterProduct): boolean {
  return (
    tpl.categoryName === "Consumables" ||
    tpl.code.startsWith("GLOVE") ||
    tpl.code.startsWith("MASK") ||
    tpl.code.startsWith("SYR")
  );
}

export function listPharmacyStarterTemplates() {
  return DEFAULT_PHARMACY_STARTER_PRODUCTS.map((p) => ({
    code: p.code,
    name: p.name,
    genericName: p.genericName,
    sku: p.sku,
    categoryName: p.categoryName,
    dosageFormCode: p.dosageFormCode,
    drugCategoryCode: p.drugCategoryCode,
    strengthLabel: p.strengthLabel,
    prescriptionTypeCode: p.prescriptionTypeCode,
    suggestedCost: p.suggestedCost ?? null,
    suggestedSell: p.suggestedSell ?? null,
    packSize: p.packSize ?? null,
  }));
}

export async function listStarterStatusForBusiness(businessId: string) {
  const templates = listPharmacyStarterTemplates();
  const existing = await db
    .select({ sku: products.sku })
    .from(products)
    .where(eq(products.businessId, businessId));
  const skuSet = new Set(
    existing
      .map((r) => (r.sku ?? "").trim().toUpperCase())
      .filter(Boolean),
  );
  return templates.map((t) => ({
    ...t,
    alreadyInCatalogue: skuSet.has(t.sku.toUpperCase()),
  }));
}

export async function addPharmacyStarterProductsForBusiness(
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
  await seedPharmacyCataloguesForBusiness(businessId, "PHARMACY");

  const selected =
    codes.length === 0
      ? DEFAULT_PHARMACY_STARTER_PRODUCTS
      : getPharmacyStarterByCodes(codes);

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
          message: `Unit "${tpl.stockUnitCode}" not found. Seed units in Settings.`,
        });
        continue;
      }

      const consumable = isConsumable(tpl);
      const productType = consumable ? "physical" : "medicine";

      let dosageFormId: string | null = null;
      let drugCategoryId: string | null = null;
      let drugStrengthId: string | null = null;
      let prescriptionTypeId: string | null = null;

      if (!consumable) {
        dosageFormId = await resolveDosageFormId(
          businessId,
          tpl.dosageFormCode,
        );
        drugCategoryId = await resolveDrugCategoryId(
          businessId,
          tpl.drugCategoryCode,
        );
        drugStrengthId = await resolveStrengthId(
          businessId,
          tpl.strengthLabel,
        );
        prescriptionTypeId = await resolveRxTypeId(
          businessId,
          tpl.prescriptionTypeCode,
        );
        if (!dosageFormId || !drugCategoryId || !prescriptionTypeId) {
          failed++;
          results.push({
            code: tpl.code,
            status: "failed",
            message:
              "Pharmacy catalogue incomplete. Run “Load default catalogues” first.",
          });
          continue;
        }
      }

      const product = await productService.createProduct({
        businessId,
        productType,
        categoryId,
        supplierId: null,
        manufacturerId: null,
        drugCategoryId,
        dosageFormId,
        drugStrengthId,
        prescriptionTypeId,
        purchaseUnitId: purchaseUnitId ?? stockUnitId,
        salesUnitId: salesUnitId ?? stockUnitId,
        stockUnitId,
        incomeAccountId: null,
        expenseAccountId: null,
        inventoryAccountId: null,
        taxRateId: null,
        name: tpl.name,
        genericName: consumable ? null : tpl.genericName,
        productBrand: tpl.productBrand ?? null,
        description: tpl.description ?? null,
        sku: tpl.sku,
        barcode: tpl.barcode ?? null,
        packSize: tpl.packSize ?? null,
        costPrice: tpl.suggestedCost ?? null,
        trackInventory: true,
        trackBatch: !consumable,
        trackExpiry: !consumable,
        serialized: false,
        allowNegativeStock: false,
        minimumStock: tpl.minimumStock ?? 0,
        reorderLevel: tpl.reorderLevel ?? 0,
        active: true,
      });

      const extraUnits: Array<{
        unitId: string;
        factor: number;
        purchaseDefault: boolean;
        salesDefault: boolean;
      }> = [];

      if (tpl.stripFactor && tpl.stripFactor > 1) {
        const stripId = await resolveUnitId(businessId, "STRIP");
        if (stripId && stripId !== stockUnitId) {
          extraUnits.push({
            unitId: stripId,
            factor: tpl.stripFactor,
            purchaseDefault: false,
            salesDefault: false,
          });
        }
      }
      if (tpl.boxFactor && tpl.boxFactor > 1) {
        const boxId = await resolveUnitId(businessId, "BOX");
        if (boxId && boxId !== stockUnitId) {
          extraUnits.push({
            unitId: boxId,
            factor: tpl.boxFactor,
            purchaseDefault: true,
            salesDefault: false,
          });
        }
      }

      for (const eu of extraUnits) {
        try {
          assertValidFactor(eu.factor);
          await productUnitRepository.createMany([
            {
              businessId,
              productId: product.id,
              unitId: eu.unitId,
              factorToStock: String(eu.factor),
              isStockUnit: false,
              isPurchaseDefault: eu.purchaseDefault,
              isSalesDefault: eu.salesDefault,
              allowPurchase: true,
              allowSale: true,
              active: true,
            },
          ]);
        } catch {
          /* packaging optional */
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
          /* non-fatal */
        }
      }

      created++;
      results.push({
        code: tpl.code,
        status: "created",
        message: `Created ${tpl.name}`,
      });
    } catch (e) {
      failed++;
      results.push({
        code: tpl.code,
        status: "failed",
        message: e instanceof Error ? e.message : "Create failed",
      });
    }
  }

  return { created, skipped, failed, results };
}
