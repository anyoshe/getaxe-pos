import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema/inventory/products";
import { categories } from "@/db/schema/inventory/categories";
import { inventoryBalances } from "@/db/schema/inventory/inventory_balances";
import { productPrices } from "@/db/schema/inventory/product_prices";
import { priceLists } from "@/db/schema/inventory/price_lists";

import {
  projectCostAfterReceive,
  suggestSellPrice,
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
 * optionally push suggested sell prices to default (retail) and wholesale lists.
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
  let wholesaleMarkup: number | null = null;
  if (product.categoryId) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.id, product.categoryId),
      columns: {
        markupPercent: true,
        wholesaleMarkupPercent: true,
      },
    });
    categoryMarkup =
      cat?.markupPercent != null ? Number(cat.markupPercent) : null;
    wholesaleMarkup =
      cat?.wholesaleMarkupPercent != null
        ? Number(cat.wholesaleMarkupPercent)
        : null;
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
    !projection.priceLocked
  ) {
    if (
      projection.suggestedSellPrice != null &&
      projection.suggestedSellPrice > 0
    ) {
      await upsertSellPriceOnList({
        businessId: input.businessId,
        productId: input.productId,
        price: projection.suggestedSellPrice,
        target: "retail",
      });
    }

    if (
      wholesaleMarkup != null &&
      Number.isFinite(wholesaleMarkup) &&
      wholesaleMarkup >= 0
    ) {
      const basis = projection.newAverageCost;
      if (basis > 0) {
        const wsSell = suggestSellPrice(basis, wholesaleMarkup);
        if (wsSell > 0) {
          await upsertSellPriceOnList({
            businessId: input.businessId,
            productId: input.productId,
            price: wsSell,
            target: "wholesale",
          });
        }
      }
    }
  }

  return projection;
}

async function upsertSellPriceOnList(input: {
  businessId: string;
  productId: string;
  price: number;
  target: "retail" | "wholesale";
}) {
  let listId: string | null = null;

  if (input.target === "retail") {
    const defaultList = await db.query.priceLists.findFirst({
      where: and(
        eq(priceLists.businessId, input.businessId),
        eq(priceLists.isDefault, true),
        eq(priceLists.active, true),
      ),
    });
    listId = defaultList?.id ?? null;
  } else {
    const all = await db.query.priceLists.findMany({
      where: and(
        eq(priceLists.businessId, input.businessId),
        eq(priceLists.active, true),
      ),
    });
    const match = all.find(
      (l) =>
        /wholesale|ws|trade/i.test(l.code ?? "") ||
        /wholesale|trade/i.test(l.name ?? ""),
    );
    if (match) {
      listId = match.id;
    } else {
      const [created] = await db
        .insert(priceLists)
        .values({
          businessId: input.businessId,
          name: "Wholesale",
          code: "WS",
          isDefault: false,
          active: true,
        })
        .returning();
      listId = created?.id ?? null;
    }
  }

  if (!listId) return;

  const existing = await db.query.productPrices.findFirst({
    where: and(
      eq(productPrices.businessId, input.businessId),
      eq(productPrices.productId, input.productId),
      eq(productPrices.priceListId, listId),
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
      priceListId: listId,
      price: priceStr,
      minimumQuantity: "1",
      active: true,
    });
  }
}
