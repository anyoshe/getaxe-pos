import { z } from "zod";

/** FormData often sends "" for empty selects — treat as null. */
const emptyToNull = (v: unknown) =>
  v === "" || v === undefined || v === null ? null : v;

const nullableUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable(),
);

const requiredUuid = (label: string) =>
  z.preprocess(
    emptyToNull,
    z.string().uuid({ message: `${label} is required` }),
  );

export const createProductSchema = z.object({
  productType: z.enum([
    "physical",
    "service",
    "medicine",
    "raw-material",
    "finished-product",
  ]),

  categoryId: requiredUuid("Category"),

  supplierId: nullableUuid,
  manufacturerId: nullableUuid,
  drugCategoryId: nullableUuid,
  dosageFormId: nullableUuid,
  drugStrengthId: nullableUuid,
  prescriptionTypeId: nullableUuid,

  purchaseUnitId: nullableUuid,
  salesUnitId: nullableUuid,
  stockUnitId: nullableUuid,

  incomeAccountId: nullableUuid,
  expenseAccountId: nullableUuid,
  inventoryAccountId: nullableUuid,
  taxRateId: nullableUuid,

  name: z.string().trim().min(2, "Product name is required"),

  genericName: z.preprocess(emptyToNull, z.string().nullable()),
  productBrand: z.preprocess(emptyToNull, z.string().nullable()),
  description: z.preprocess(emptyToNull, z.string().nullable()),
  sku: z.preprocess(emptyToNull, z.string().nullable()),
  barcode: z.preprocess(emptyToNull, z.string().nullable()),
  packSize: z.preprocess(emptyToNull, z.string().nullable()),

  costPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().nullable(),
  ),

  trackInventory: z.boolean(),
  trackBatch: z.boolean(),
  trackExpiry: z.boolean(),
  serialized: z.boolean(),
  allowNegativeStock: z.boolean(),

  minimumStock: z.coerce.number().int().default(0),
  reorderLevel: z.coerce.number().int().default(0),

  active: z.boolean(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
