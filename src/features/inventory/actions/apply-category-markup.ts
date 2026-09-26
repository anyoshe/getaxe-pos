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
import { ensureProductCostingSchema } from "../services/ensure-product-costing-schema";

export type MarkupTarget = "retail" | "wholesale";

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

async function resolvePriceList(
  businessId: string,
  target: MarkupTarget,
): Promise<{ id: string; name: string } | null> {
  if (target === "retail") {
    const defaultList = await db.query.priceLists.findFirst({
      where: and(
        eq(priceLists.businessId, businessId),
        eq(priceLists.isDefault, true),
        eq(priceLists.active, true),
      ),
    });
    if (defaultList) return { id: defaultList.id, name: defaultList.name };
    const any = await db.query.priceLists.findFirst({
      where: and(
        eq(priceLists.businessId, businessId),
        eq(priceLists.active, true),
      ),
    });
    return any ? { id: any.id, name: any.name } : null;
  }

  // Wholesale / trade / WS
  const all = await db.query.priceLists.findMany({
    where: and(
      eq(priceLists.businessId, businessId),
      eq(priceLists.active, true),
    ),
  });
  const match = all.find(
    (l) =>
      /wholesale|ws|trade/i.test(l.code ?? "") ||
      /wholesale|trade/i.test(l.name ?? ""),
  );
  if (match) return { id: match.id, name: match.name };

  // Auto-create a Wholesale list so apply can succeed
  const [created] = await db
    .insert(priceLists)
    .values({
      businessId,
      name: "Wholesale",
      code: "WS",
      isDefault: false,
      active: true,
    })
    .returning();
  return created ? { id: created.id, name: created.name } : null;
}

/**
 * Apply category markup to retail (default) or wholesale price list:
 * sell ≈ cost × (1 + markup%).
 * Retail uses category.markupPercent (product.markupPercent override).
 * Wholesale uses category.wholesaleMarkupPercent only (no product override yet).
 */
export async function applyCategoryMarkupAction(input: {
  categoryId: string;
  commit: boolean;
  /** Default retail. */
  target?: MarkupTarget;
}) {
  const user = await requireAuthorizedUser("categories.update");
  const target: MarkupTarget = input.target === "wholesale" ? "wholesale" : "retail";

  await ensureProductCostingSchema();

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
    target === "wholesale"
      ? category.wholesaleMarkupPercent != null
        ? Number(category.wholesaleMarkupPercent)
        : null
      : category.markupPercent != null
        ? Number(category.markupPercent)
        : null;

  if (catMarkup == null || !Number.isFinite(catMarkup) || catMarkup < 0) {
    return {
      success: false as const,
      message:
        target === "wholesale"
          ? "Set a wholesale markup % on this category and save first, then apply."
          : "Set a retail markup % on this category and save first, then apply.",
    };
  }

  const list = await resolvePriceList(user.businessId, target);
  if (!list) {
    return {
      success: false as const,
      message:
        target === "wholesale"
          ? "Could not find or create a Wholesale price list."
          : "Create an active default (retail) price list under Product prices first.",
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
    // Product-level markup only overrides retail
    let markup = catMarkup;
    if (target === "retail") {
      const productMarkup =
        p.markupPercent != null ? Number(p.markupPercent) : null;
      if (productMarkup != null && Number.isFinite(productMarkup)) {
        markup = productMarkup;
      }
    }

    const avg = p.costPrice != null ? Number(p.costPrice) : 0;
    const last =
      p.lastPurchaseCost != null ? Number(p.lastPurchaseCost) : avg;
    const cost = costBasisForPricing(avg, last, "MOVING_AVERAGE");

    const existing = await db.query.productPrices.findFirst({
      where: and(
        eq(productPrices.businessId, user.businessId),
        eq(productPrices.productId, p.id),
        eq(productPrices.priceListId, list.id),
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
          priceListId: list.id,
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
    target,
    priceListName: list.name,
    markupPercent: catMarkup,
    appliedCount,
    lines,
    message: input.commit
      ? `Applied ${target} markup (${catMarkup}%) to ${appliedCount} product(s) on “${list.name}”.`
      : `Preview: ${lines.filter((l) => !l.skippedReason).length} product(s) → ${target} list “${list.name}” @ ${catMarkup}%.`,
  };
}
