import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { categories } from "./categories";
import { suppliers } from "./suppliers";

import { manufacturers } from "../pharmacy/manufacturers";
import { dosageForms } from "../pharmacy/dosage_forms";
import { drugCategories } from "../pharmacy/drug_categories";
import { drugStrengths } from "../pharmacy/drug_strengths";
import { prescriptionTypes } from "../pharmacy/prescription_types";

import { units } from "../settings/units";

import { chartOfAccounts } from "../finance/chart_of_accounts";
import { taxRates } from "../finance/tax_rates";

import { relations } from "drizzle-orm";

import { productPrices } from "./product_prices";
import { productBatches } from "./product_batches";
import { stockMovements } from "./stock_movements";
import { inventoryBalances } from "./inventory_balances";

export const products = pgTable(
  "products",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),

    productType: text("product_type").notNull(),

    supplierId: uuid("supplier_id")
      .references(() => suppliers.id),

    manufacturerId: uuid("manufacturer_id")
      .references(() => manufacturers.id),

    drugCategoryId: uuid("drug_category_id")
      .references(() => drugCategories.id),

    dosageFormId: uuid("dosage_form_id")
      .references(() => dosageForms.id),

    drugStrengthId: uuid("drug_strength_id")
      .references(() => drugStrengths.id),

    prescriptionTypeId: uuid("prescription_type_id")
      .references(() => prescriptionTypes.id),

    purchaseUnitId: uuid("purchase_unit_id")
      .references(() => units.id),

    salesUnitId: uuid("sales_unit_id")
      .references(() => units.id),

    stockUnitId: uuid("stock_unit_id")
      .references(() => units.id),

    incomeAccountId: uuid("income_account_id")
      .references(() => chartOfAccounts.id),

    expenseAccountId: uuid("expense_account_id")
      .references(() => chartOfAccounts.id),

    inventoryAccountId: uuid("inventory_account_id")
      .references(() => chartOfAccounts.id),

    taxRateId: uuid("tax_rate_id")
      .references(() => taxRates.id),

    // Product Information

    name: text("name")
      .notNull(),

    genericName: text("generic_name"),

    productBrand: text("product_brand"),

    description: text("description"),

    sku: text("sku"),

    barcode: text("barcode"),

    packSize: text("pack_size"),

    costPrice: numeric("cost_price", {
      precision: 12,
      scale: 2,
    }),

    // Inventory Behaviour

    trackInventory: boolean("track_inventory")
      .default(true)
      .notNull(),

    trackBatch: boolean("track_batch")
      .default(false)
      .notNull(),

    trackExpiry: boolean("track_expiry")
      .default(false)
      .notNull(),

    serialized: boolean("serialized")
      .default(false)
      .notNull(),

    allowNegativeStock: boolean("allow_negative_stock")
      .default(false)
      .notNull(),

    minimumStock: integer("minimum_stock")
      .default(0)
      .notNull(),

    reorderLevel: integer("reorder_level")
      .default(0)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("products_business_idx")
      .on(table.businessId),

    categoryIdx: index("products_category_idx")
      .on(table.categoryId),

    supplierIdx: index("products_supplier_idx")
      .on(table.supplierId),

    manufacturerIdx: index("products_manufacturer_idx")
      .on(table.manufacturerId),

    drugCategoryIdx: index("products_drug_category_idx")
      .on(table.drugCategoryId),

    barcodeIdx: uniqueIndex(
      "products_business_barcode_unique"
    ).on(
      table.businessId,
      table.barcode
    ),

    skuIdx: uniqueIndex(
      "products_business_sku_unique"
    ).on(
      table.businessId,
      table.sku
    ),

    businessNameIdx: index("products_business_name_idx")
      .on(
        table.businessId,
        table.name
      ),
  })
);
export const productsRelations = relations(
  products,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [products.businessId],
      references: [businesses.id],
    }),

    category: one(categories, {
      fields: [products.categoryId],
      references: [categories.id],
    }),

    supplier: one(suppliers, {
      fields: [products.supplierId],
      references: [suppliers.id],
    }),
    purchaseUnit: one(units, {
      fields: [products.purchaseUnitId],
      references: [units.id],
    }),

    salesUnit: one(units, {
      fields: [products.salesUnitId],
      references: [units.id],
    }),

    stockUnit: one(units, {
      fields: [products.stockUnitId],
      references: [units.id],
    }),

    // Pharmacy

    manufacturer: one(manufacturers, {
      fields: [products.manufacturerId],
      references: [manufacturers.id],
    }),

    drugCategory: one(drugCategories, {
      fields: [products.drugCategoryId],
      references: [drugCategories.id],
    }),

    dosageForm: one(dosageForms, {
      fields: [products.dosageFormId],
      references: [dosageForms.id],
    }),

    drugStrength: one(drugStrengths, {
      fields: [products.drugStrengthId],
      references: [drugStrengths.id],
    }),

    prescriptionType: one(prescriptionTypes, {
      fields: [products.prescriptionTypeId],
      references: [prescriptionTypes.id],
    }),

    // Finance

    incomeAccount: one(chartOfAccounts, {
      fields: [products.incomeAccountId],
      references: [chartOfAccounts.id],
    }),

    expenseAccount: one(chartOfAccounts, {
      fields: [products.expenseAccountId],
      references: [chartOfAccounts.id],
    }),

    inventoryAccount: one(chartOfAccounts, {
      fields: [products.inventoryAccountId],
      references: [chartOfAccounts.id],
    }),

    taxRate: one(taxRates, {
      fields: [products.taxRateId],
      references: [taxRates.id],
    }),
    prices: many(productPrices),

    batches: many(productBatches),

    stockMovements: many(stockMovements),

    inventoryBalances: many(inventoryBalances),
  })
);

