import {
  businessSettingsRepository,
} from "@/repositories/settings/business-settings.repository";

import {
  branchesRepository,
} from "@/repositories/settings/branches.repository";

import {
  warehousesRepository,
} from "@/repositories/settings/warehouses.repository";

import {
  fiscalYearsRepository,
} from "@/repositories/settings/fiscal-years.repository";

import {
  Repository,
} from "@/repositories/base";

import {
  currencies,
} from "@/db/schema/settings/currencies";

import {
  paymentMethods,
} from "@/db/schema/settings/payment_methods";

import {
  taxRates,
} from "@/db/schema/finance/tax_rates";

import {
  eq,
} from "drizzle-orm";

class BusinessSettingsService {

  async getSettings(
    businessId: string,
  ) {

    return businessSettingsRepository.findByBusinessId(
      businessId,
    );

  }

  async createDefaultSettings(
    businessId: string,
  ) {

    const existing =
      await businessSettingsRepository.findByBusinessId(
        businessId,
      );

    if (existing) {
      return existing;
    }

    //
    // Default Branch
    //
    const branches =
      await branchesRepository.findAll(
        businessId,
      );

    const branch =
      branches.find(
        (branch) =>
          branch.isHeadOffice,
      );

    if (!branch) {
      throw new Error(
        "Head office branch not found.",
      );
    }

    //
    // Default Warehouse
    //
    const warehouses =
      await warehousesRepository.findAll(
        businessId,
      );

    const warehouse =
      warehouses.find(
        (warehouse) =>
          warehouse.branchId ===
          branch.id,
      );

    if (!warehouse) {
      throw new Error(
        "Default warehouse not found.",
      );
    }

    //
    // Current Fiscal Year
    //
    const fiscalYear =
      await fiscalYearsRepository.findCurrent(
        businessId,
      );

    if (!fiscalYear) {
      throw new Error(
        "Current fiscal year not found.",
      );
    }

    //
    // Currency
    //
    const currency =
      await Repository.db.query.currencies.findFirst({

        where: eq(
          currencies.code,
          "KES",
        ),

      });

    if (!currency) {
      throw new Error(
        "Default currency not found.",
      );
    }

    //
    // Payment Method
    //
    const paymentMethod =
      await Repository.db.query.paymentMethods.findFirst({

        where: eq(
          paymentMethods.code,
          "CASH",
        ),

      });

    if (!paymentMethod) {
      throw new Error(
        "Default payment method not found.",
      );
    }

    //
    // Tax Rate
    //
    const taxRate =
      await Repository.db.query.taxRates.findFirst({

        where: eq(
          taxRates.code,
          "VAT16",
        ),

      });

    if (!taxRate) {
      throw new Error(
        "Default tax rate not found.",
      );
    }

    return businessSettingsRepository.create({

      businessId,

      defaultBranchId:
        branch.id,

      defaultWarehouseId:
        warehouse.id,

      defaultCurrencyId:
        currency.id,

      defaultPaymentMethodId:
        paymentMethod.id,

      defaultTaxRateId:
        taxRate.id,

      currentFiscalYearId:
        fiscalYear.id,

      allowNegativeStock:
        false,

      autoPostJournals:
        true,

      trackInventoryByBatch:
        true,

      enableExpiryTracking:
        true,

      allowBackdatedTransactions:
        false,

      requireCustomerOnSale:
        false,

      requireSupplierOnPurchase:
        true,

    });

  }

}

export const businessSettingsService =
  new BusinessSettingsService();