/** Drizzle numeric columns are typed as string — coerce for math. */
export function qty(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Format number for numeric column inserts.
 * Preserves fractional quantities (kg, L, g) up to 6 decimal places.
 * Strips trailing zeros so "4.500000" → "4.5".
 */
export function qtyStr(value: string | number | null | undefined): string {
  const n = qty(value);
  if (!Number.isFinite(n)) return "0";
  // Avoid scientific notation for typical stock ranges
  const fixed = n.toFixed(6);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/** True when qty is a positive whole number (serialized items). */
export function isWholePositiveQty(n: number): boolean {
  return Number.isFinite(n) && n > 0 && Math.abs(n - Math.round(n)) < 1e-9;
}

/**
 * Normalize stock quantity for non-serialized lines: keep decimals.
 * For serialized lines, callers should require whole units separately.
 */
export function normalizeStockQty(n: number, options?: { maxDecimals?: number }): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  const d = options?.maxDecimals ?? 6;
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
