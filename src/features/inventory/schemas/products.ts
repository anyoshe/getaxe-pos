import { z } from "zod";

const nullableUuid = z.string().uuid().nullable();

export const createProductSchema = z.object({

  // --------------------------------------------------------------------------
  // Classification
  // --------------------------------------------------------------------------

    productType:
    z.enum([
      "physical",
      "service",
      "medicine",
      "raw-material",
      "finished-product",
    ]),

  categoryId:
    z.string().uuid(),

  supplierId:
    nullableUuid,

  manufacturerId:
    nullableUuid,

  drugCategoryId:
    nullableUuid,

  dosageFormId:
    nullableUuid,

  drugStrengthId:
    nullableUuid,

  prescriptionTypeId:
    nullableUuid,


  // --------------------------------------------------------------------------
  // Units
  // --------------------------------------------------------------------------

  purchaseUnitId:
    nullableUuid,

  salesUnitId:
    nullableUuid,

  stockUnitId:
    nullableUuid,


  // --------------------------------------------------------------------------
  // Finance
  // --------------------------------------------------------------------------

  incomeAccountId:
    nullableUuid,

  expenseAccountId:
    nullableUuid,

  inventoryAccountId:
    nullableUuid,

  taxRateId:
    nullableUuid,


  // --------------------------------------------------------------------------
  // Product Information
  // --------------------------------------------------------------------------

  name:
    z.string()
      .trim()
      .min(2, "Product name is required"),

  genericName:
    z.string()
      .nullable(),

  productBrand:
    z.string()
      .nullable(),

  description:
    z.string()
      .nullable(),

  sku:
    z.string()
      .nullable(),

  barcode:
    z.string()
      .nullable(),

  packSize:
    z.string()
      .nullable(),

  costPrice:
    z.number()
      .nullable(),


  // --------------------------------------------------------------------------
  // Inventory Behaviour
  // --------------------------------------------------------------------------

  trackInventory:
    z.boolean(),

  trackBatch:
    z.boolean(),

  trackExpiry:
    z.boolean(),

  serialized:
    z.boolean(),

  allowNegativeStock:
    z.boolean(),

  minimumStock:
    z.number()
      .int(),

  reorderLevel:
    z.number()
      .int(),

  active:
    z.boolean(),

});

export type CreateProductInput =
  z.infer<typeof createProductSchema>;