import type { InferSelectModel } from "drizzle-orm";

import { productPrices } from "@/db/schema/inventory/product_prices";
import { products } from "@/db/schema/inventory/products";
import { categories } from "@/db/schema/inventory/categories";
import { priceLists } from "@/db/schema/inventory/price_lists";

export type ProductPriceProduct = InferSelectModel<typeof products> & {
  category?: InferSelectModel<typeof categories> | null;
};

export type ProductPrice = InferSelectModel<typeof productPrices> & {
  product: ProductPriceProduct;
  priceList: InferSelectModel<typeof priceLists>;
};

/** Effective markup: product override, else category default. */
export function effectiveMarkupFromPriceRow(row: {
  product: {
    markupPercent?: string | number | null;
    category?: { markupPercent?: string | number | null } | null;
  };
}): number | null {
  const p = row.product.markupPercent;
  if (p != null && p !== "" && Number.isFinite(Number(p))) {
    return Number(p);
  }
  const c = row.product.category?.markupPercent;
  if (c != null && c !== "" && Number.isFinite(Number(c))) {
    return Number(c);
  }
  return null;
}

export function productCostFromPriceRow(row: {
  product: {
    costPrice?: string | number | null;
    lastPurchaseCost?: string | number | null;
  };
}): number | null {
  const avg = row.product.costPrice;
  if (avg != null && avg !== "" && Number.isFinite(Number(avg))) {
    return Number(avg);
  }
  const last = row.product.lastPurchaseCost;
  if (last != null && last !== "" && Number.isFinite(Number(last))) {
    return Number(last);
  }
  return null;
}
