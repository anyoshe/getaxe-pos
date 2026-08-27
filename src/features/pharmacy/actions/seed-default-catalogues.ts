"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { businessService } from "@/features/business/services";
import { seedPharmacyCataloguesForBusiness } from "../services/seed-pharmacy-catalogues.service";

/**
 * Seed default dosage forms / drug categories / strengths / Rx types
 * for the current business (idempotent). Useful for pharmacies created
 * before auto-seed existed.
 */
export async function seedDefaultPharmacyCataloguesAction() {
  const user = await requireAuthorizedUser("products.update");

  let businessType: string | null = null;
  try {
    const business = await businessService.getBusiness(user.businessId);
    businessType = business?.businessType ?? null;
  } catch {
    businessType = null;
  }

  try {
    // Force seed even if type is missing (user explicitly requested)
    const result = await seedPharmacyCataloguesForBusiness(
      user.businessId,
      businessType ?? "PHARMACY",
    );

    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/products");

    const total =
      result.dosageForms +
      result.drugCategories +
      result.drugStrengths +
      result.prescriptionTypes;

    return {
      success: true as const,
      message:
        total === 0
          ? "Default catalogues already present — nothing new added."
          : `Seeded ${result.dosageForms} dosage forms, ${result.drugCategories} categories, ${result.drugStrengths} strengths, ${result.prescriptionTypes} prescription types.`,
      result,
    };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Seed failed.",
    };
  }
}
