"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import {
  addPharmacyStarterProductsForBusiness,
  listStarterStatusForBusiness,
  listPharmacyStarterTemplates,
} from "../services/seed-pharmacy-starter-products.service";

export async function listPharmacyStarterProductsAction() {
  const user = await requireAuthorizedUser("products.view");
  try {
    const rows = await listStarterStatusForBusiness(user.businessId);
    return { success: true as const, products: rows };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to list starter products.",
      products: listPharmacyStarterTemplates().map((t) => ({
        ...t,
        alreadyInCatalogue: false,
      })),
    };
  }
}

/** Add selected template medicines as product masters (no stock). */
export async function addPharmacyStarterProductsAction(codes: string[]) {
  const user = await requireAuthorizedUser("products.create");
  try {
    const result = await addPharmacyStarterProductsForBusiness(
      user.businessId,
      codes ?? [],
    );
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock/receive");

    const msg = [
      result.created ? `${result.created} product(s) created` : null,
      result.skipped ? `${result.skipped} already present` : null,
      result.failed ? `${result.failed} failed` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      success: result.failed === 0 || result.created > 0,
      message:
        msg ||
        "No products were added. Select at least one line that is not already in your catalogue.",
      ...result,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to add starter products.",
      created: 0,
      skipped: 0,
      failed: 0,
      results: [] as Array<{
        code: string;
        status: "created" | "skipped" | "failed";
        message: string;
      }>,
    };
  }
}
