"use server";

import { revalidatePath } from "next/cache";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import {
  addPharmacyStarterProductsForBusiness,
  listStarterStatusForBusiness,
  listPharmacyStarterTemplates,
  listProgrammeTbHivTemplates,
  addProgrammeTbHivProductsForBusiness,
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


/** List opt-in TB/HIV programme templates (not in retail default seed). */
export async function listProgrammeTbHivProductsAction() {
  const user = await requireAuthorizedUser("products.view");
  try {
    const templates = listProgrammeTbHivTemplates();
    const retailStatus = await listStarterStatusForBusiness(user.businessId);
    // listStarterStatus only covers DEFAULT list — mark programme by SKU presence via same service codes
    const { db } = await import("@/db");
    const { products } = await import("@/db/schema/inventory/products");
    const { and, eq, inArray } = await import("drizzle-orm");
    const skus = templates.map((t) => t.sku);
    const existing = skus.length
      ? await db.query.products.findMany({
          where: and(
            eq(products.businessId, user.businessId),
            inArray(products.sku, skus),
          ),
          columns: { sku: true },
        })
      : [];
    const have = new Set(existing.map((r) => (r.sku || "").toUpperCase()));
    return {
      success: true as const,
      products: templates.map((t) => ({
        ...t,
        alreadyInCatalogue: have.has(t.sku.toUpperCase()),
      })),
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to list programme products.",
      products: listProgrammeTbHivTemplates().map((t) => ({
        ...t,
        alreadyInCatalogue: false,
      })),
    };
  }
}

/** Seed selected (or all) TB/HIV programme lines — supplyChannel=programme, POS-hidden. */
export async function addProgrammeTbHivProductsAction(codes: string[]) {
  const user = await requireAuthorizedUser("products.create");
  try {
    const result = await addProgrammeTbHivProductsForBusiness(
      user.businessId,
      codes ?? [],
    );
    revalidatePath("/inventory/products");
    revalidatePath("/inventory/pharmacy-catalogues");
    revalidatePath("/inventory/stock");
    const msg = [
      result.created ? `${result.created} programme product(s) created` : null,
      result.skipped ? `${result.skipped} already present` : null,
      result.failed ? `${result.failed} failed` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    return {
      success: result.failed === 0 || result.created > 0,
      message:
        msg ||
        "No programme products were added. Enable catalogues first if seeding failed.",
      ...result,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to add programme products.",
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
