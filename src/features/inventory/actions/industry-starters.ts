"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { businessRepository } from "@/repositories/core/business.repository";

import {
  DEFAULT_INDUSTRY_STARTER_PRODUCTS,
  type IndustryStarterKitId,
} from "../constants/industry-starters/default-industry-starters";
import {
  filterKitsList,
  resolveIndustryKitsForBusinessType,
} from "../constants/industry-starters/kit-by-business-type";
import {
  addIndustryStarterProductsForBusiness,
  listIndustryStarterStatusForBusiness,
} from "../services/seed-industry-starters.service";

export async function listIndustryStarterProductsAction(
  kit?: IndustryStarterKitId,
) {
  try {
    const user = await requireAuthorizedUser("products.view");
    const business = await businessRepository.findById(user.businessId);
    const rows = await listIndustryStarterStatusForBusiness(
      user.businessId,
      kit,
      { businessType: business?.businessType ?? null },
    );
    return { success: true as const, products: rows };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to list starters",
      products: [] as Awaited<
        ReturnType<typeof listIndustryStarterStatusForBusiness>
      >,
    };
  }
}

export async function addIndustryStarterProductsAction(codes: string[]) {
  try {
    const user = await requireAuthorizedUser("products.create");
    const business = await businessRepository.findById(user.businessId);
    const resolved = resolveIndustryKitsForBusinessType(
      business?.businessType ?? null,
    );

    if (resolved === "pharmacy-only") {
      return {
        success: false as const,
        message:
          "This business type uses Pharmacy catalogues for medicine starters, not industry kits.",
        created: 0,
        skipped: 0,
        failed: 0,
        results: [],
      };
    }

    const allowedKits =
      resolved === "all" ? null : new Set(filterKitsList(resolved));

    const filteredCodes = (codes ?? []).filter((code) => {
      if (!allowedKits) return true;
      const tpl = DEFAULT_INDUSTRY_STARTER_PRODUCTS.find(
        (p) => p.code.toUpperCase() === code.trim().toUpperCase(),
      );
      return tpl ? allowedKits.has(tpl.kit) : false;
    });

    if (filteredCodes.length === 0 && (codes?.length ?? 0) > 0) {
      return {
        success: false as const,
        message: "Selected products are not allowed for this business type.",
        created: 0,
        skipped: 0,
        failed: 0,
        results: [],
      };
    }

    const result = await addIndustryStarterProductsForBusiness(
      user.businessId,
      filteredCodes,
    );
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/starter-kits");
    revalidatePath("/inventory/categories");
    return {
      success: true as const,
      message: `Created ${result.created}, skipped ${result.skipped}, failed ${result.failed}.`,
      ...result,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to add starters",
      created: 0,
      skipped: 0,
      failed: 0,
      results: [],
    };
  }
}
