/**
 * Canonical stock unit conversion helpers.
 * Transaction units are for users; stock units are for the inventory engine.
 */

export type ProductUnitFactor = {
  unitId: string;
  factorToStock: number;
  isStockUnit?: boolean;
  allowSale?: boolean;
  allowPurchase?: boolean;
  active?: boolean;
  validTo?: Date | string | null;
};

export class UnitConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnitConversionError";
  }
}

/** Validate a factor value. */
export function assertValidFactor(factor: number, label = "Conversion factor") {
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new UnitConversionError(`${label} must be a positive number.`);
  }
}

/**
 * Convert entered quantity in a product unit into canonical stock units.
 * Rounds to integer stock qty for count-based balances (current schema).
 */
export function toStockQuantity(
  quantityEntered: number,
  factorToStock: number,
  options?: { allowDecimals?: boolean },
): number {
  assertValidFactor(factorToStock);
  if (!Number.isFinite(quantityEntered)) {
    throw new UnitConversionError("Quantity entered is not a number.");
  }
  if (quantityEntered < 0) {
    throw new UnitConversionError("Quantity entered cannot be negative.");
  }

  const raw = quantityEntered * factorToStock;
  if (options?.allowDecimals) {
    return raw;
  }
  // Count products: stock balances are integers
  const rounded = Math.round(raw);
  if (Math.abs(raw - rounded) > 1e-9) {
    // Near-integer is fine; true fractional count is invalid
    if (Math.abs(raw - Math.floor(raw)) > 1e-9 && Math.abs(raw - Math.ceil(raw)) > 1e-9) {
      throw new UnitConversionError(
        `Conversion yields non-integer stock quantity (${raw}). Use whole units for count products.`,
      );
    }
  }
  return rounded;
}

export function findActiveProductUnit(
  units: ProductUnitFactor[],
  unitId: string,
): ProductUnitFactor {
  const row = units.find(
    (u) =>
      u.unitId === unitId &&
      u.active !== false &&
      (u.validTo == null || u.validTo === undefined),
  );
  if (!row) {
    throw new UnitConversionError(
      "Selected unit is not configured for this product (or is inactive).",
    );
  }
  assertValidFactor(Number(row.factorToStock));
  return row;
}

/**
 * Resolve conversion for a product line.
 * If unitId is omitted, uses stock unit (factor 1) or the sole isStockUnit row.
 */
export function resolveToStock(params: {
  productUnits: ProductUnitFactor[];
  unitId?: string | null;
  quantityEntered: number;
  requireSale?: boolean;
  requirePurchase?: boolean;
  allowDecimals?: boolean;
}): {
  unitId: string | null;
  quantityEntered: number;
  factorToStock: number;
  quantityStock: number;
} {
  const {
    productUnits,
    unitId,
    quantityEntered,
    requireSale,
    requirePurchase,
    allowDecimals,
  } = params;

  let factor = 1;
  let resolvedUnitId: string | null = unitId ?? null;

  if (unitId) {
    const row = findActiveProductUnit(productUnits, unitId);
    if (requireSale && row.allowSale === false) {
      throw new UnitConversionError("This unit is not allowed for sales.");
    }
    if (requirePurchase && row.allowPurchase === false) {
      throw new UnitConversionError("This unit is not allowed for purchasing.");
    }
    factor = Number(row.factorToStock);
  } else {
    const stock = productUnits.find(
      (u) => u.isStockUnit && u.active !== false && !u.validTo,
    );
    if (stock) {
      resolvedUnitId = stock.unitId;
      factor = Number(stock.factorToStock) || 1;
    }
  }

  const quantityStock = toStockQuantity(quantityEntered, factor, {
    allowDecimals,
  });

  return {
    unitId: resolvedUnitId,
    quantityEntered,
    factorToStock: factor,
    quantityStock,
  };
}

/** Cost per stock unit from cost in entered unit. */
export function costPerStockUnit(
  costPerEnteredUnit: number,
  factorToStock: number,
): number {
  assertValidFactor(factorToStock);
  return costPerEnteredUnit / factorToStock;
}
