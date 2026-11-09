"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { businessService } from "@/features/business/services/business.service";
import { businessCapabilityService } from "@/features/capabilities/services";
import type { BusinessType } from "@/features/business/constants/business-types";
import { listIndustryStarterByKit } from "@/features/inventory/constants/industry-starters/default-industry-starters";
import { addIndustryStarterProductsForBusiness } from "@/features/inventory/services/seed-industry-starters.service";
import { addPharmacyStarterProductsForBusiness } from "@/features/pharmacy/services/seed-pharmacy-starter-products.service";
import { seedPharmacyCataloguesForBusiness } from "@/features/pharmacy/services/seed-pharmacy-catalogues.service";
import type { GoLiveVertical } from "../lib/go-live-day";
import { packForVertical } from "../lib/vertical-pack";

export type ApplyVerticalPackResult =
  | {
      success: true;
      businessType: BusinessType;
      vertical: GoLiveVertical;
      capabilitiesApplied: true;
      startersCreated: number;
      startersSkipped: number;
      startersFailed: number;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

/**
 * One-click vertical bootstrap:
 * 1. Set business type
 * 2. Re-apply capability profile for that type (idempotent enable)
 * 3. Optionally load starter product masters (no stock)
 */
export async function applyVerticalPackAction(input: {
  vertical: GoLiveVertical;
  /** Default true — load recommended starter catalogue */
  loadStarters?: boolean;
}): Promise<ApplyVerticalPackResult> {
  try {
    const user = await requireAuthorizedUser("business.update");
    const pack = packForVertical(input.vertical);
    const loadStarters = input.loadStarters !== false;

    await businessService.updateBusiness(user.businessId, {
      businessType: pack.businessType,
    });

    await businessCapabilityService.provision(
      user.businessId,
      pack.businessType,
    );

    if (pack.usePharmacyStarters) {
      await seedPharmacyCataloguesForBusiness(
        user.businessId,
        pack.businessType,
      );
    }

    let startersCreated = 0;
    let startersSkipped = 0;
    let startersFailed = 0;

    if (loadStarters) {
      if (pack.usePharmacyStarters) {
        const result = await addPharmacyStarterProductsForBusiness(
          user.businessId,
          [], // all pharmacy templates
        );
        startersCreated = result.created;
        startersSkipped = result.skipped;
        startersFailed = result.failed;
      } else {
        const codes = pack.industryKits.flatMap((kit) =>
          listIndustryStarterByKit(kit).map((p) => p.code),
        );
        if (codes.length > 0) {
          const result = await addIndustryStarterProductsForBusiness(
            user.businessId,
            codes,
          );
          startersCreated = result.created;
          startersSkipped = result.skipped;
          startersFailed = result.failed;
        }
      }
    }

    revalidatePath("/settings/go-live");
    revalidatePath("/settings/business");
    revalidatePath("/settings/capabilities");
    revalidatePath("/settings/readiness");
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/starter-kits");
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/dashboard");

    const parts = [
      `Type set to ${pack.label}`,
      "capabilities applied",
      loadStarters
        ? `${startersCreated} product(s) added` +
          (startersSkipped ? `, ${startersSkipped} already present` : "") +
          (startersFailed ? `, ${startersFailed} failed` : "")
        : "starters skipped",
    ];

    return {
      success: true,
      businessType: pack.businessType,
      vertical: pack.vertical,
      capabilitiesApplied: true,
      startersCreated,
      startersSkipped,
      startersFailed,
      message: parts.join(" · "),
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Could not apply vertical pack",
    };
  }
}
