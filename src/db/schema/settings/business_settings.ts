import {
  pgTable,
  uuid,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { branches } from "./branches";
import { warehouses } from "./warehouses";
import { currencies } from "./currencies";
import { paymentMethods } from "./payment_methods";
import { fiscalYears } from "./fiscal_years";
import { taxRates } from "../finance/tax_rates";
import { relations } from "drizzle-orm";



export const businessSettings = pgTable(
  "business_settings",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    defaultBranchId: uuid("default_branch_id")
      .references(() => branches.id),

    defaultWarehouseId: uuid("default_warehouse_id")
      .references(() => warehouses.id),

    defaultCurrencyId: uuid("default_currency_id")
      .references(() => currencies.id),

    defaultPaymentMethodId: uuid("default_payment_method_id")
      .references(() => paymentMethods.id),

    defaultTaxRateId: uuid("default_tax_rate_id")
      .references(() => taxRates.id),

    currentFiscalYearId: uuid("current_fiscal_year_id")
      .references(() => fiscalYears.id),

    allowNegativeStock: boolean("allow_negative_stock")
      .default(false)
      .notNull(),

    autoPostJournals: boolean("auto_post_journals")
      .default(true)
      .notNull(),

    trackInventoryByBatch: boolean("track_inventory_by_batch")
      .default(true)
      .notNull(),

    enableExpiryTracking: boolean("enable_expiry_tracking")
      .default(true)
      .notNull(),

    allowBackdatedTransactions: boolean("allow_backdated_transactions")
      .default(false)
      .notNull(),

    requireCustomerOnSale: boolean("require_customer_on_sale")
      .default(false)
      .notNull(),

    requireSupplierOnPurchase: boolean("require_supplier_on_purchase")
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
    businessUnique: uniqueIndex(
      "business_settings_business_unique"
    ).on(table.businessId),
  })
);

export const businessSettingsRelations = relations(
  businessSettings,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessSettings.businessId],
      references: [businesses.id],
    }),

    defaultBranch: one(branches, {
      fields: [businessSettings.defaultBranchId],
      references: [branches.id],
    }),

    defaultWarehouse: one(warehouses, {
      fields: [businessSettings.defaultWarehouseId],
      references: [warehouses.id],
    }),

    defaultCurrency: one(currencies, {
      fields: [businessSettings.defaultCurrencyId],
      references: [currencies.id],
    }),

    defaultPaymentMethod: one(paymentMethods, {
      fields: [businessSettings.defaultPaymentMethodId],
      references: [paymentMethods.id],
    }),

    defaultTaxRate: one(taxRates, {
      fields: [businessSettings.defaultTaxRateId],
      references: [taxRates.id],
    }),

    currentFiscalYear: one(fiscalYears, {
      fields: [businessSettings.currentFiscalYearId],
      references: [fiscalYears.id],
    }),
  })
);