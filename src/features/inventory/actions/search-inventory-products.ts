"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productService } from "@/features/inventory/services";

export type InventoryProductHit = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  productType: string;
  trackInventory: boolean;
  trackBatch: boolean;
  trackExpiry: boolean;
  serialized: boolean;
  costPrice: number | null;
  supplierId: string | null;
  active: boolean;
};

/**
 * Typeahead search for inventory forms (receive, etc.).
 * Does not load the full catalogue — name / SKU / barcode, limited rows.
 */
export async function searchInventoryProductsAction(input: {
  query: string;
  limit?: number;
  /** When true, only physical/trackable stock items */
  stockableOnly?: boolean;
}): Promise<
  | { success: true; products: InventoryProductHit[] }
  | { success: false; message: string; products: InventoryProductHit[] }
> {
  try {
    const user = await requireAuthorizedUser("products.view");
    const q = (input.query ?? "").trim();
    if (q.length < 1) {
      return { success: true, products: [] };
    }

    const limit = Math.min(40, Math.max(5, input.limit ?? 20));
    const rows = await productService.getProductsForPos(user.businessId, {
      search: q,
      limit: limit * 2, // over-fetch then filter stockable
    });

    let hits: InventoryProductHit[] = (rows as Record<string, unknown>[]).map(
      (p) => ({
        id: String(p.id),
        name: String(p.name),
        sku: (p.sku as string | null) ?? null,
        barcode: (p.barcode as string | null) ?? null,
        productType: String(p.productType ?? "physical"),
        trackInventory: p.trackInventory !== false,
        trackBatch: Boolean(p.trackBatch),
        trackExpiry: Boolean(p.trackExpiry),
        serialized: Boolean(p.serialized),
        costPrice: p.costPrice != null ? Number(p.costPrice) : null,
        supplierId: (p.supplierId as string | null) ?? null,
        active: p.active !== false,
      }),
    );

    if (input.stockableOnly !== false) {
      hits = hits.filter(
        (p) =>
          p.active &&
          p.trackInventory &&
          p.productType !== "service",
      );
    }

    return { success: true, products: hits.slice(0, limit) };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Search failed",
      products: [],
    };
  }
}
