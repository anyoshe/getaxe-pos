import { unitsRepository } from "@/repositories/settings/units.repository";
import { unitAllowsDecimalQuantities } from "@/lib/quantity";

/**
 * Decimals are allowed only when the product's stock unit (or explicit
 * transaction unit) is mass/volume. Count units (PCS, TAB, BOX, …) stay whole.
 */
export async function productAllowsDecimalQty(
  businessId: string,
  opts: {
    stockUnitId?: string | null;
    transactionUnitId?: string | null;
  },
): Promise<boolean> {
  const ids = [opts.stockUnitId, opts.transactionUnitId].filter(
    (id): id is string => Boolean(id),
  );
  if (ids.length === 0) return false;

  for (const id of ids) {
    const unit = await unitsRepository.findById(id, businessId);
    if (unitAllowsDecimalQuantities(unit)) return true;
  }
  return false;
}
