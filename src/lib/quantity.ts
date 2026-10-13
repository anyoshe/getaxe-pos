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
  const fixed = n.toFixed(6);
  return fixed.replace(/\.?0+$/, "") || "0";
}

/** True when qty is a positive whole number (count / serialized items). */
export function isWholePositiveQty(n: number): boolean {
  return Number.isFinite(n) && n > 0 && Math.abs(n - Math.round(n)) < 1e-9;
}

/** True when qty is a whole number (including zero). */
export function isWholeQty(n: number): boolean {
  return Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9;
}

/** Categories that may use fractional quantities. */
export const DECIMAL_QTY_CATEGORIES = new Set(["mass", "volume"]);

/** Fallback codes if category is missing on older unit rows. */
export const DECIMAL_QTY_CODES = new Set([
  "KG",
  "G",
  "MG",
  "TON",
  "LB",
  "LTR",
  "L",
  "ML",
  "CL",
  "GAL",
]);

/**
 * Whether this unit of measure may accept decimal quantities.
 * Prefer DB flag allowDecimals, then category, then known codes.
 * Default: false (count / discrete = whole numbers only).
 */
export function unitAllowsDecimalQuantities(unit: {
  category?: string | null;
  allowDecimals?: boolean | null;
  code?: string | null;
} | null | undefined): boolean {
  if (!unit) return false;
  if (unit.allowDecimals === true) return true;
  const cat = (unit.category ?? "").toLowerCase();
  if (DECIMAL_QTY_CATEGORIES.has(cat)) return true;
  if (unit.allowDecimals === false) return false;
  const code = (unit.code ?? "").toUpperCase().trim();
  return DECIMAL_QTY_CODES.has(code);
}

/**
 * Reject fractional qty for count units.
 */
export function assertQtyForUnit(
  quantity: number,
  allowsDecimals: boolean,
  label = "Quantity",
): void {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
  if (!allowsDecimals && !isWholeQty(quantity)) {
    throw new Error(
      `${label} must be a whole number for this unit (pieces, packs, tablets, etc.). Use kg/L/g only for mass or volume products.`,
    );
  }
}

/**
 * Normalize stock quantity.
 * Count units: round to whole. Mass/volume: up to 6 decimals.
 */
export function normalizeStockQty(
  n: number,
  options?: { maxDecimals?: number; allowDecimals?: boolean },
): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (options?.allowDecimals === false) {
    return Math.round(n);
  }
  const d = options?.maxDecimals ?? 6;
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
