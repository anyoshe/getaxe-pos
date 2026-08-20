"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { productRepository } from "@/repositories/inventory/products.repository";

export async function lookupProductCodeAction(code: string) {
  const user = await requireAuthorizedUser("products.view");
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      success: false as const,
      message: "Enter or scan a barcode / SKU.",
      product: null,
      matchedBy: null as null,
    };
  }
  const byBarcode = await productRepository.findByBarcode(user.businessId, trimmed);
  if (byBarcode) {
    return {
      success: true as const,
      message: "Product found by barcode.",
      product: byBarcode,
      matchedBy: "barcode" as const,
    };
  }
  const bySku = await productRepository.findBySku(user.businessId, trimmed);
  if (bySku) {
    return {
      success: true as const,
      message: "Product found by SKU.",
      product: bySku,
      matchedBy: "sku" as const,
    };
  }
  return {
    success: true as const,
    message: "No existing product for this code.",
    product: null,
    matchedBy: null as null,
  };
}
