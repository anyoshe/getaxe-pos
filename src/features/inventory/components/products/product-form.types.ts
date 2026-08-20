import { z } from "zod";

import type {
  Product,
  ProductType,
} from "../../types/products";

import type {
  ProductContext,
} from "../../types";

/*
|--------------------------------------------------------------------------
| Form Schema
|--------------------------------------------------------------------------
*/

export const productFormSchema = z.object({

  productType:
    z.custom<ProductType>()
      .nullable()
      .refine(
        (value) => value !== null,
        "Product type is required"
      ),

  categoryId:
    z.string().uuid(),

  supplierId:
    z.string().uuid().nullable(),

  manufacturerId:
    z.string().uuid().nullable(),

  drugCategoryId:
    z.string().uuid().nullable(),

  dosageFormId:
    z.string().uuid().nullable(),

  drugStrengthId:
    z.string().uuid().nullable(),

  prescriptionTypeId:
    z.string().uuid().nullable(),

  purchaseUnitId:
    z.string().uuid().nullable(),

  salesUnitId:
    z.string().uuid().nullable(),

  stockUnitId:
    z.string().uuid().nullable(),

  incomeAccountId:
    z.string().uuid().nullable(),

  expenseAccountId:
    z.string().uuid().nullable(),

  inventoryAccountId:
    z.string().uuid().nullable(),

  taxRateId:
    z.string().uuid().nullable(),

  name:
    z.string()
      .trim()
      .min(2),

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

  minimumStock:
    z.number(),

  reorderLevel:
    z.number(),

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

  active:
    z.boolean(),

});

export type ProductFormInput =
  z.input<typeof productFormSchema>;

export type ProductFormOutput =
  z.output<typeof productFormSchema>;

/*
|--------------------------------------------------------------------------
| Shared Select Option
|--------------------------------------------------------------------------
*/

export interface SelectOption {
  id: string;
  name: string;
}

/*
|--------------------------------------------------------------------------
| Lookup Data
|--------------------------------------------------------------------------
*/

export interface ProductLookupData {

  categories:
    SelectOption[];

  suppliers:
    SelectOption[];

  units:
    SelectOption[];

  manufacturers:
    SelectOption[];

  drugCategories:
    SelectOption[];

  dosageForms:
    SelectOption[];

  drugStrengths:
    SelectOption[];

  prescriptionTypes:
    SelectOption[];

  taxRates:
    SelectOption[];

  incomeAccounts:
    SelectOption[];

  expenseAccounts:
    SelectOption[];

  inventoryAccounts:
    SelectOption[];
}

/*
|--------------------------------------------------------------------------
| Component Props
|--------------------------------------------------------------------------
*/

export interface ProductFormProps {

  product?:
    Product | null;

  context:
    ProductContext;

  prefill?:
    Partial<ProductFormInput> | null;

  onSuccess?:
    () => void;

}