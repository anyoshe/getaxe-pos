/**
 * Moving weighted average cost + markup-based suggested sell prices.
 * Cost is always in canonical stock units.
 */

export type PricingCostBasis = "MOVING_AVERAGE" | "LAST_PURCHASE" | "MAX_OF_BOTH";

export function computeMovingAverageCost(input: {
  qtyOnHand: number;
  currentAverageCost: number | null | undefined;
  qtyReceived: number;
  receiptUnitCost: number;
}): number {
  const onHand = Math.max(0, Number(input.qtyOnHand) || 0);
  const received = Number(input.qtyReceived) || 0;
  const receiptCost = Number(input.receiptUnitCost);
  if (!(received > 0) || !Number.isFinite(receiptCost) || receiptCost < 0) {
    const prev = Number(input.currentAverageCost);
    return Number.isFinite(prev) && prev >= 0 ? prev : 0;
  }
  if (onHand <= 0) {
    return roundCost(receiptCost);
  }
  const prevAvg = Number(input.currentAverageCost);
  const avg = Number.isFinite(prevAvg) && prevAvg >= 0 ? prevAvg : receiptCost;
  const total = onHand * avg + received * receiptCost;
  const units = onHand + received;
  return roundCost(total / units);
}

export function effectiveMarkupPercent(
  productMarkup: number | null | undefined,
  categoryMarkup: number | null | undefined,
): number {
  if (productMarkup != null && Number.isFinite(Number(productMarkup))) {
    return Math.max(0, Number(productMarkup));
  }
  if (categoryMarkup != null && Number.isFinite(Number(categoryMarkup))) {
    return Math.max(0, Number(categoryMarkup));
  }
  return 0;
}

export function costBasisForPricing(
  averageCost: number,
  lastPurchaseCost: number,
  basis: PricingCostBasis = "MOVING_AVERAGE",
): number {
  const avg = Math.max(0, Number(averageCost) || 0);
  const last = Math.max(0, Number(lastPurchaseCost) || 0);
  switch (basis) {
    case "LAST_PURCHASE":
      return last > 0 ? last : avg;
    case "MAX_OF_BOTH":
      return Math.max(avg, last);
    case "MOVING_AVERAGE":
    default:
      return avg > 0 ? avg : last;
  }
}

/** Sell = cost × (1 + markup%/100). Markup is on cost. */
export function suggestSellPrice(
  cost: number,
  markupPercent: number,
  roundTo = 1,
): number {
  const c = Math.max(0, Number(cost) || 0);
  const m = Math.max(0, Number(markupPercent) || 0);
  const raw = c * (1 + m / 100);
  if (!(roundTo > 0)) return roundMoney(raw);
  return Math.round(raw / roundTo) * roundTo;
}

export function roundCost(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export type CostUpdateResult = {
  previousAverageCost: number | null;
  newAverageCost: number;
  lastPurchaseCost: number;
  suggestedSellPrice: number | null;
  markupPercent: number;
  priceLocked: boolean;
};

export function projectCostAfterReceive(input: {
  qtyOnHandBeforeReceive: number;
  currentAverageCost: number | null | undefined;
  qtyReceivedStock: number;
  receiptCostPerStockUnit: number;
  productMarkupPercent?: number | null;
  categoryMarkupPercent?: number | null;
  priceLocked?: boolean;
  pricingBasis?: PricingCostBasis;
  priceRoundTo?: number;
}): CostUpdateResult {
  const lastPurchaseCost = roundCost(Number(input.receiptCostPerStockUnit) || 0);
  const newAverageCost = computeMovingAverageCost({
    qtyOnHand: input.qtyOnHandBeforeReceive,
    currentAverageCost: input.currentAverageCost,
    qtyReceived: input.qtyReceivedStock,
    receiptUnitCost: lastPurchaseCost,
  });
  const markupPercent = effectiveMarkupPercent(
    input.productMarkupPercent,
    input.categoryMarkupPercent,
  );
  const basisCost = costBasisForPricing(
    newAverageCost,
    lastPurchaseCost,
    input.pricingBasis ?? "MOVING_AVERAGE",
  );
  const suggestedSellPrice =
    markupPercent > 0 && basisCost > 0
      ? suggestSellPrice(basisCost, markupPercent, input.priceRoundTo ?? 1)
      : null;

  return {
    previousAverageCost:
      input.currentAverageCost != null && Number.isFinite(Number(input.currentAverageCost))
        ? Number(input.currentAverageCost)
        : null,
    newAverageCost,
    lastPurchaseCost,
    suggestedSellPrice,
    markupPercent,
    priceLocked: Boolean(input.priceLocked),
  };
}
