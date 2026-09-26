"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { categories } from "@/db/schema/inventory/categories";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { priceLists } from "@/db/schema/inventory/price_lists";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import {
  costBasisForPricing,
  suggestSellPrice,
} from "../services/product-costing";

export type MarkupPreviewLine = {
  productId: string;
  name: string;
  sku: string | null;
  costPrice: number;
  previousSell: number | null;
  suggestedSell: number;
  applied: boolean;
  skippedReason?: string;
};

/**
 * Apply category (or product override) markup to default price list:
 * sell ≈ cost × (1 + markup%). Shows cost → previous → new for confirmation.
 */
export async function applyCategoryMarkupAction(input: {
  categoryId: string;
  /** If true, write suggested prices; if false, only preview. */
  commit: boolean;
}) {
  const user = await requireAuthorizedUser("categories.update");

  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, input.categoryId),
      eq(categories.businessId, user.businessId),
    ),
  });

  if (!category) {
    return { success: false as const, message: "Category not found." };
  }

  const catMarkup =
    category.markupPercent != null ? Number(category.markupPercent) : null;
  if (catMarkup == null || !Number.isFinite(catMarkup) || catMarkup < 0) {
    return {
      success: false as const,
      message:
        "Set a default markup % on this category and save first, then apply.",
    };
  }

  const defaultList = await db.query.priceLists.findFirst({
    where: and(
      eq(priceLists.businessId, user.businessId),
      eq(priceLists.isDefault, true),
      eq(priceLists.active, true),
    ),
  });

  if (!defaultList) {
    return {
      success: false as const,
      message: "Create an active default price list under Product prices first.",
    };
  }

  const productRows = await db.query.products.findMany({
    where: and(
      eq(products.businessId, user.businessId),
      eq(products.categoryId, input.categoryId),
      eq(products.active, true),
    ),
    columns: {
      id: true,
      name: true,
      sku: true,
      costPrice: true,
      lastPurchaseCost: true,
      markupPercent: true,
      priceLocked: true,
    },
  });

  const lines: MarkupPreviewLine[] = [];
  let appliedCount = 0;

  for (const p of productRows) {
    const productMarkup =
      p.markupPercent != null ? Number(p.markupPercent) : null;
    const markup =
      productMarkup != null && Number.isFinite(productMarkup)
        ? productMarkup
        : catMarkup;

    const avg = p.costPrice != null ? Number(p.costPrice) : 0;
    const last =
      p.lastPurchaseCost != null ? Number(p.lastPurchaseCost) : avg;
    const cost = costBasisForPricing(avg, last, "MOVING_AVERAGE");

    const existing = await db.query.productPrices.findFirst({
      where: and(
        eq(productPrices.businessId, user.businessId),
        eq(productPrices.productId, p.id),
        eq(productPrices.priceListId, defaultList.id),
        eq(productPrices.active, true),
      ),
    });
    const previousSell =
      existing?.price != null ? Number(existing.price) : null;

    if (!(cost > 0)) {
      lines.push({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        costPrice: cost,
        previousSell,
        suggestedSell: 0,
        applied: false,
        skippedReason: "No cost price on product",
      });
      continue;
    }

    if (p.priceLocked) {
      lines.push({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        costPrice: cost,
        previousSell,
        suggestedSell: suggestSellPrice(cost, markup),
        applied: false,
        skippedReason: "Price locked",
      });
      continue;
    }

    const suggestedSell = suggestSellPrice(cost, markup);

    if (input.commit) {
      const priceStr = suggestedSell.toFixed(2);
      if (existing) {
        await db
          .update(productPrices)
          .set({ price: priceStr, updatedAt: new Date() })
          .where(eq(productPrices.id, existing.id));
      } else {
        await db.insert(productPrices).values({
          businessId: user.businessId,
          productId: p.id,
          priceListId: defaultList.id,
          price: priceStr,
          minimumQuantity: "1",
          active: true,
        });
      }
      appliedCount += 1;
    }

    lines.push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      costPrice: cost,
      previousSell,
      suggestedSell,
      applied: input.commit,
    });
  }

  if (input.commit) {
    revalidatePath("/inventory/categories");
    revalidatePath("/inventory/product-prices");
    revalidatePath("/inventory/products");
    revalidatePath("/sales/pos");
  }

  return {
    success: true as const,
    message: input.commit
      ? `Applied markup ${catMarkup}% to ${appliedCount} product price(s).`
      : `Preview: ${lines.filter((l) => !l.skippedReason).length} product(s) would update at ${catMarkup}% markup.`,
    markupPercent: catMarkup,
    lines,
    appliedCount,
  };
}
