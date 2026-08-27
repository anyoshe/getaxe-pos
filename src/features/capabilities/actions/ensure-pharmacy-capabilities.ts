"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { businessService } from "@/features/business/services";
import { businessCapabilityService } from "../services/business-capability.service";
import { seedPharmacyCataloguesForBusiness } from "@/features/pharmacy/services/seed-pharmacy-catalogues.service";
import { shouldSeedPharmacyCatalogues } from "@/features/pharmacy/constants/default-catalogues";
import type { BusinessType } from "@/features/business/constants/business-types";

/**
 * Re-apply pharmacy capability profile + default catalogues for
 * PHARMACY / CHEMIST / CLINIC / HOSPITAL (e.g. chemist created before mapping fix).
 */
export async function ensurePharmacyCapabilitiesAction() {
  const user = await requireAuthorizedUser("products.update");

  let businessType: string | null = null;
  try {
    const business = await businessService.getBusiness(user.businessId);
    businessType = (business as { businessType?: string })?.businessType ?? null;
  } catch {
    return {
      success: false as const,
      message: "Could not load business type.",
    };
  }

  if (!shouldSeedPharmacyCatalogues(businessType)) {
    return {
      success: false as const,
      message:
        "This business type is not pharmacy/chemist/clinic/hospital.",
    };
  }

  try {
    await businessCapabilityService.provision(
      user.businessId,
      businessType as BusinessType,
    );
    const seed = await seedPharmacyCataloguesForBusiness(
      user.businessId,
      businessType,
    );

    revalidatePath("/inventory/products");
    revalidatePath("/inventory/pharmacy-catalogues");

    return {
      success: true as const,
      message: `Pharmacy capabilities refreshed. Catalogues: +${seed.dosageForms} forms, +${seed.drugCategories} categories, +${seed.drugStrengths} strengths.`,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Failed to enable pharmacy features.",
    };
  }
}
