"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  addIndustryStarterProductsForBusiness,
  listIndustryStarterStatusForBusiness,
} from "../services/seed-industry-starters.service";
import type { IndustryStarterKitId } from "../constants/industry-starters/default-industry-starters";

export async function listIndustryStarterProductsAction(
  kit?: IndustryStarterKitId,
) {
  try {
    const user = await requireAuthorizedUser("products.view");
    const rows = await listIndustryStarterStatusForBusiness(
      user.businessId,
      kit,
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
    const result = await addIndustryStarterProductsForBusiness(
      user.businessId,
      codes,
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
