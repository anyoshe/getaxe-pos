/**
 * Pure promotional price application for POS and tests.
 * Best (lowest) matching promo wins. Wholesale callers should skip promos.
 */

export type PromotionOffer = {
  id: string;
  name: string;
  discountType: string;
  discountValue: number;
  scope: string;
  productIds: string[];
};

export function applyPromotion(
  base: number,
  productId: string,
  promos: PromotionOffer[],
): { price: number; promoName: string | null; promoId: string | null } {
  if (!(base > 0) || promos.length === 0) {
    return { price: Math.max(0, base), promoName: null, promoId: null };
  }

  let best = base;
  let promoName: string | null = null;
  let promoId: string | null = null;

  for (const promo of promos) {
    if (promo.scope === "SELECTED" && !promo.productIds.includes(productId)) {
      continue;
    }
    let next = base;
    if (promo.discountType === "PERCENT_OFF") {
      next = base * (1 - promo.discountValue / 100);
    } else if (promo.discountType === "AMOUNT_OFF") {
      next = base - promo.discountValue;
    } else if (promo.discountType === "FIXED_PRICE") {
      next = promo.discountValue;
    }
    next = Math.max(0, next);
    if (next < best) {
      best = next;
      promoName = promo.name;
      promoId = promo.id;
    }
  }

  return { price: best, promoName, promoId };
}

/** Pack/retail price before promo: explicit unit price or piece × factor. */
export function resolveUnitPrice(input: {
  retailPrice: number;
  wholesalePrice: number;
  priceMode: "retail" | "wholesale";
  unitId?: string | null;
  factorToStock?: number;
  pricesByUnit?: Record<string, number>;
}): number {
  const base =
    input.priceMode === "wholesale" ? input.wholesalePrice : input.retailPrice;
  const factor =
    input.factorToStock != null && input.factorToStock > 0
      ? input.factorToStock
      : 1;
  if (input.unitId) {
    const explicit = input.pricesByUnit?.[input.unitId];
    if (explicit != null && explicit > 0) return explicit;
  }
  return base * factor;
}
