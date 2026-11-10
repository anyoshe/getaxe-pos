import type { ProductContext, ProductType } from "../../types";
import type { ProductFormInput } from "./product-form.types";

const STICKY_KEY = "getaxe.productCreate.sticky";

export type StickyProductPrefs = {
  productType?: ProductType;
  categoryId?: string;
  stockUnitId?: string | null;
  salesUnitId?: string | null;
  purchaseUnitId?: string | null;
  trackInventory?: boolean;
  trackBatch?: boolean;
  trackExpiry?: boolean;
};

export function readStickyProductPrefs(): StickyProductPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STICKY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StickyProductPrefs;
  } catch {
    return {};
  }
}

export function writeStickyProductPrefs(prefs: StickyProductPrefs) {
  if (typeof window === "undefined") return;
  try {
    const prev = readStickyProductPrefs();
    sessionStorage.setItem(
      STICKY_KEY,
      JSON.stringify({ ...prev, ...prefs }),
    );
  } catch {
    /* ignore quota */
  }
}

function pickDefaultType(
  context: ProductContext,
  sticky?: StickyProductPrefs,
): ProductType {
  if (
    sticky?.productType &&
    context.productTypes?.includes(sticky.productType)
  ) {
    return sticky.productType;
  }
  const caps = context.businessCapabilities ?? [];
  if (
    caps.some((c) => c.startsWith("pharmacy.")) &&
    context.productTypes?.includes("medicine")
  ) {
    // Medicine needs full form (catalogue fields) — prefer physical for quick path
    if (context.productTypes.includes("physical")) return "physical";
    return "medicine";
  }
  if (context.productTypes?.includes("physical")) return "physical";
  return context.productTypes?.[0] ?? "physical";
}

function pickDefaultUnit(context: ProductContext, stickyId?: string | null) {
  if (stickyId && context.units.some((u) => u.id === stickyId)) {
    return stickyId;
  }
  const pcs = context.units.find(
    (u) =>
      /^(pcs|pc|each|ea|unit)$/i.test(u.code ?? "") ||
      /piece|each/i.test(u.name ?? ""),
  );
  return pcs?.id ?? context.units[0]?.id ?? null;
}

/**
 * Smart defaults for create — sticky session + business units/categories.
 * Does not bypass server validation; only prefills FormData/form values.
 */
export function buildProductCreateDefaults(
  context: ProductContext,
  overrides?: Partial<ProductFormInput> & { sticky?: StickyProductPrefs },
): ProductFormInput {
  const sticky = overrides?.sticky ?? readStickyProductPrefs();
  const productType =
    (overrides?.productType as ProductType | null) ??
    pickDefaultType(context, sticky);

  const unitId = pickDefaultUnit(context, sticky.stockUnitId);
  const categoryId =
    overrides?.categoryId ||
    (sticky.categoryId &&
    context.categories.some((c) => c.id === sticky.categoryId)
      ? sticky.categoryId
      : "") ||
    context.categories[0]?.id ||
    "";

  const trackInventory =
    overrides?.trackInventory ??
    sticky.trackInventory ??
    productType !== "service";

  const isPharmacy = (context.businessCapabilities ?? []).some((c) =>
    c.startsWith("pharmacy."),
  );

  return {
    productType,
    categoryId,
    supplierId: overrides?.supplierId ?? null,
    manufacturerId: overrides?.manufacturerId ?? null,
    drugCategoryId: overrides?.drugCategoryId ?? null,
    dosageFormId: overrides?.dosageFormId ?? null,
    drugStrengthId: overrides?.drugStrengthId ?? null,
    prescriptionTypeId: overrides?.prescriptionTypeId ?? null,
    purchaseUnitId:
      overrides?.purchaseUnitId ?? sticky.purchaseUnitId ?? unitId,
    salesUnitId: overrides?.salesUnitId ?? sticky.salesUnitId ?? unitId,
    stockUnitId: overrides?.stockUnitId ?? sticky.stockUnitId ?? unitId,
    incomeAccountId: overrides?.incomeAccountId ?? null,
    expenseAccountId: overrides?.expenseAccountId ?? null,
    inventoryAccountId: overrides?.inventoryAccountId ?? null,
    taxRateId: overrides?.taxRateId ?? null,
    name: overrides?.name ?? "",
    genericName: overrides?.genericName ?? null,
    productBrand: overrides?.productBrand ?? null,
    description: overrides?.description ?? null,
    sku: overrides?.sku ?? null,
    barcode: overrides?.barcode ?? null,
    packSize: overrides?.packSize ?? null,
    costPrice: overrides?.costPrice ?? null,
    sellingPrice: overrides?.sellingPrice ?? null,
    minimumStock: overrides?.minimumStock ?? 0,
    reorderLevel: overrides?.reorderLevel ?? 0,
    trackInventory,
    trackBatch:
      overrides?.trackBatch ??
      sticky.trackBatch ??
      (isPharmacy && productType === "medicine"),
    trackExpiry:
      overrides?.trackExpiry ??
      sticky.trackExpiry ??
      (isPharmacy && productType === "medicine"),
    serialized: overrides?.serialized ?? false,
    allowNegativeStock: overrides?.allowNegativeStock ?? false,
    active: overrides?.active ?? true,
  };
}

/** Types safe on the one-screen quick form (medicine keeps full wizard). */
export function isQuickAddFriendlyType(type: ProductType | null): boolean {
  return type === "physical" || type === "service" || type === "raw-material" || type === "finished-product";
}
