import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { categories } from "@/db/schema/inventory/categories";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { priceLists } from "@/db/schema/inventory/price_lists";

import {
  projectCostAfterReceive,
  type CostUpdateResult,
  type PricingCostBasis,
} from "./product-costing";

export type ApplyReceiveCostingInput = {
  businessId: string;
  productId: string;
  qtyReceivedStock: number;
  receiptCostPerStockUnit: number;
  qtyOnHandBeforeReceive?: number;
  applySuggestedSellPrice?: boolean;
  pricingBasis?: PricingCostBasis;
};

/**
 * After stock is received: update moving average + last purchase cost,
 * optionally push suggested sell price to the default price list.
 */
export async function applyReceiveCosting(
  input: ApplyReceiveCostingInput,
): Promise<CostUpdateResult | null> {
  const receiptCost = Number(input.receiptCostPerStockUnit);
  const qtyReceived = Number(input.qtyReceivedStock);
  if (!(qtyReceived > 0) || !Number.isFinite(receiptCost) || receiptCost < 0) {
    return null;
  }

  const product = await db.query.products.findFirst({
    where: and(
      eq(products.id, input.productId),
      eq(products.businessId, input.businessId),
    ),
    columns: {
      id: true,
      costPrice: true,
      lastPurchaseCost: true,
      markupPercent: true,
      priceLocked: true,
      categoryId: true,
    },
  });

  if (!product) return null;

  let qtyBefore = input.qtyOnHandBeforeReceive;
  if (qtyBefore == null) {
    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${inventoryBalances.quantity}), 0)`,
      })
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.businessId, input.businessId),
          eq(inventoryBalances.productId, input.productId),
        ),
      );
    const onHandAfter = Number(row?.total ?? 0);
    qtyBefore = Math.max(0, onHandAfter - qtyReceived);
  }

  let categoryMarkup: number | null = null;
  if (product.categoryId) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.id, product.categoryId),
      columns: { markupPercent: true },
    });
    categoryMarkup =
      cat?.markupPercent != null ? Number(cat.markupPercent) : null;
  }

  const projection = projectCostAfterReceive({
    qtyOnHandBeforeReceive: qtyBefore,
    currentAverageCost:
      product.costPrice != null ? Number(product.costPrice) : null,
    qtyReceivedStock: qtyReceived,
    receiptCostPerStockUnit: receiptCost,
    productMarkupPercent:
      product.markupPercent != null ? Number(product.markupPercent) : null,
    categoryMarkupPercent: categoryMarkup,
    priceLocked: product.priceLocked,
    pricingBasis: input.pricingBasis ?? "MOVING_AVERAGE",
  });

  await db
    .update(products)
    .set({
      costPrice: projection.newAverageCost.toFixed(4),
      lastPurchaseCost: projection.lastPurchaseCost.toFixed(4),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, input.productId),
        eq(products.businessId, input.businessId),
      ),
    );

  if (
    input.applySuggestedSellPrice &&
    !projection.priceLocked &&
    projection.suggestedSellPrice != null &&
    projection.suggestedSellPrice > 0
  ) {
    await upsertDefaultSellPrice({
      businessId: input.businessId,
      productId: input.productId,
      price: projection.suggestedSellPrice,
    });
  }

  return projection;
}

async function upsertDefaultSellPrice(input: {
  businessId: string;
  productId: string;
  price: number;
}) {
  const defaultList = await db.query.priceLists.findFirst({
    where: and(
      eq(priceLists.businessId, input.businessId),
      eq(priceLists.isDefault, true),
      eq(priceLists.active, true),
    ),
  });
  if (!defaultList) return;

  const existing = await db.query.productPrices.findFirst({
    where: and(
      eq(productPrices.businessId, input.businessId),
      eq(productPrices.productId, input.productId),
      eq(productPrices.priceListId, defaultList.id),
      eq(productPrices.active, true),
    ),
  });

  const priceStr = input.price.toFixed(2);
  if (existing) {
    await db
      .update(productPrices)
      .set({ price: priceStr, updatedAt: new Date() })
      .where(eq(productPrices.id, existing.id));
  } else {
    await db.insert(productPrices).values({
      businessId: input.businessId,
      productId: input.productId,
      priceListId: defaultList.id,
      price: priceStr,
      minimumQuantity: "1",
      active: true,
    });
  }
}
