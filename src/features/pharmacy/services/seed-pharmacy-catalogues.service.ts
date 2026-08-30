import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  dosageForms,
  drugCategories,
  drugStrengths,
  prescriptionTypes,
} from "@/db/schema/pharmacy";
import { categories as productCategories } from "@/db/schema/inventory/categories";

import {
  DEFAULT_DOSAGE_FORMS,
  DEFAULT_DRUG_CATEGORIES,
  DEFAULT_DRUG_STRENGTHS,
  DEFAULT_PRESCRIPTION_TYPES,
  shouldSeedPharmacyCatalogues,
} from "../constants/default-catalogues";

/**
 * Idempotent seed of pharmacy reference data for a business.
 * Safe to call on every provision or from an admin action.
 */
export async function seedPharmacyCataloguesForBusiness(
  businessId: string,
  businessType?: string | null,
): Promise<{
  dosageForms: number;
  drugCategories: number;
  drugStrengths: number;
  prescriptionTypes: number;
}> {
  if (businessType != null && !shouldSeedPharmacyCatalogues(businessType)) {
    return {
      dosageForms: 0,
      drugCategories: 0,
      drugStrengths: 0,
      prescriptionTypes: 0,
    };
  }

  let forms = 0;
  let categories = 0;
  let strengths = 0;
  let rxTypes = 0;

  for (const row of DEFAULT_DOSAGE_FORMS) {
    const existing = await db
      .select({ id: dosageForms.id })
      .from(dosageForms)
      .where(
        and(
          eq(dosageForms.businessId, businessId),
          eq(dosageForms.code, row.code),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(dosageForms).values({
      businessId,
      code: row.code,
      name: row.name,
      active: true,
    });
    forms++;
  }

  for (const row of DEFAULT_DRUG_CATEGORIES) {
    const existing = await db
      .select({ id: drugCategories.id })
      .from(drugCategories)
      .where(
        and(
          eq(drugCategories.businessId, businessId),
          eq(drugCategories.code, row.code),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(drugCategories).values({
      businessId,
      code: row.code,
      name: row.name,
      active: true,
    });
    categories++;
  }

  for (const label of DEFAULT_DRUG_STRENGTHS) {
    const code = label.replace(/\s+/g, "").toUpperCase();
    const existing = await db
      .select({ id: drugStrengths.id })
      .from(drugStrengths)
      .where(
        and(
          eq(drugStrengths.businessId, businessId),
          eq(drugStrengths.code, code),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(drugStrengths).values({
      businessId,
      code,
      name: label,
      active: true,
    });
    strengths++;
  }

  for (const row of DEFAULT_PRESCRIPTION_TYPES) {
    const existing = await db
      .select({ id: prescriptionTypes.id })
      .from(prescriptionTypes)
      .where(
        and(
          eq(prescriptionTypes.businessId, businessId),
          eq(prescriptionTypes.code, row.code),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(prescriptionTypes).values({
      businessId,
      code: row.code,
      name: row.name,
      dispensingLevel: row.dispensingLevel,
      active: true,
    });
    rxTypes++;
  }

  // Mirror drug categories into inventory product categories so wizard step
  // "Category" (categoryId) has the same selectable list as drug classification.
  for (const row of DEFAULT_DRUG_CATEGORIES) {
    const existing = await db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(
        and(
          eq(productCategories.businessId, businessId),
          eq(productCategories.name, row.name),
        ),
      )
      .limit(1);
    if (existing.length > 0) continue;
    await db.insert(productCategories).values({
      businessId,
      name: row.name,
      description: row.code,
      active: true,
    });
  }

  return {
    dosageForms: forms,
    drugCategories: categories,
    drugStrengths: strengths,
    prescriptionTypes: rxTypes,
  };
}

export const pharmacyCatalogueSeedService = {
  seedForBusiness: seedPharmacyCataloguesForBusiness,
  shouldSeed: shouldSeedPharmacyCatalogues,
};
