import type {
  InferSelectModel,
} from "drizzle-orm";

import type {
  products,
} from "@/db/schema/inventory/products";

import type {
  categories,
} from "@/db/schema/inventory/categories";

import type {
  suppliers,
} from "@/db/schema/inventory/suppliers";

import type {
  units,
} from "@/db/schema/settings/units";

import type {
  manufacturers,
} from "@/db/schema/pharmacy/manufacturers";

import type {
  dosageForms,
} from "@/db/schema/pharmacy/dosage_forms";

import type {
  drugCategories,
} from "@/db/schema/pharmacy/drug_categories";

import type {
  drugStrengths,
} from "@/db/schema/pharmacy/drug_strengths";

import type {
  prescriptionTypes,
} from "@/db/schema/pharmacy/prescription_types";

import type {
  taxRates,
} from "@/db/schema/finance/tax_rates";

import type {
  chartOfAccounts,
} from "@/db/schema/finance/chart_of_accounts";

import type {
  productPrices,
} from "@/db/schema/inventory/product_prices";

import type {
  productBatches,
} from "@/db/schema/inventory/product_batches";

import type {
  stockMovements,
} from "@/db/schema/inventory/stock_movements";

export const PRODUCT_TYPES = [
  "physical",
  "service",
  "medicine",
  "raw-material",
  "finished-product",
] as const;

export type ProductType =
  (typeof PRODUCT_TYPES)[number];

type DatabaseProduct =
  InferSelectModel<typeof products>;

export type Product =
  Omit<DatabaseProduct, "costPrice"> & {
    costPrice: number | null;

    category:
    InferSelectModel<typeof categories> | null;

    supplier:
    InferSelectModel<typeof suppliers> | null;

    purchaseUnit:
    InferSelectModel<typeof units> | null;

    salesUnit:
    InferSelectModel<typeof units> | null;

    stockUnit:
    InferSelectModel<typeof units> | null;

    manufacturer:
    InferSelectModel<typeof manufacturers> | null;

    dosageForm:
    InferSelectModel<typeof dosageForms> | null;

    drugCategory:
    InferSelectModel<typeof drugCategories> | null;

    drugStrength:
    InferSelectModel<typeof drugStrengths> | null;

    prescriptionType:
    InferSelectModel<typeof prescriptionTypes> | null;

    taxRate:
    InferSelectModel<typeof taxRates> | null;

    incomeAccount:
    InferSelectModel<typeof chartOfAccounts> | null;

    expenseAccount:
    InferSelectModel<typeof chartOfAccounts> | null;

    inventoryAccount:
    InferSelectModel<typeof chartOfAccounts> | null;

    prices:
    InferSelectModel<typeof productPrices>[];

    batches:
    InferSelectModel<typeof productBatches>[];

    stockMovements:
    InferSelectModel<typeof stockMovements>[];

    inventoryBalances: {
      quantity: number;
    }[];
  };
  
  export interface ProductContext {

  categories:
  InferSelectModel<typeof categories>[];

  suppliers:
  InferSelectModel<typeof suppliers>[];

  units:
  InferSelectModel<typeof units>[];

  manufacturers:
  InferSelectModel<typeof manufacturers>[];

  dosageForms:
  InferSelectModel<typeof dosageForms>[];

  drugCategories:
  InferSelectModel<typeof drugCategories>[];

  drugStrengths:
  InferSelectModel<typeof drugStrengths>[];

  prescriptionTypes:
  InferSelectModel<typeof prescriptionTypes>[];

  taxRates:
  InferSelectModel<typeof taxRates>[];

  incomeAccounts:
  InferSelectModel<typeof chartOfAccounts>[];

  expenseAccounts:
  InferSelectModel<typeof chartOfAccounts>[];

  inventoryAccounts:
  InferSelectModel<typeof chartOfAccounts>[];
}