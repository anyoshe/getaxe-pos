/**
 * Pure stock arithmetic used by cycle count, adjustments, and issue checks.
 */

export function cycleCountVariance(
  systemQty: number,
  countedQty: number | null | undefined,
): number | null {
  if (countedQty == null || !Number.isFinite(countedQty)) return null;
  return countedQty - systemQty;
}

export function canIssue(onHand: number, requestQty: number): boolean {
  return requestQty > 0 && onHand >= requestQty;
}

export function nextOnHand(onHand: number, delta: number): number {
  return onHand + delta;
}

export function wouldGoNegative(onHand: number, delta: number): boolean {
  return nextOnHand(onHand, delta) < 0;
}

/** FEFO: sort batches by earliest expiry (nulls last). */
export function sortBatchesFefo<
  T extends { expiryDate: string | null; quantity: number },
>(batches: T[]): T[] {
  return [...batches]
    .filter((b) => b.quantity > 0)
    .sort((a, b) => {
      const ea = a.expiryDate || "9999-12-31";
      const eb = b.expiryDate || "9999-12-31";
      return ea.localeCompare(eb);
    });
}
