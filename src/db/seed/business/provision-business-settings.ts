import { db } from "@/db";

import {
  and,
  eq,
} from "drizzle-orm";

import {
  businessSettings,
} from "@/db/schema/settings/business_settings";

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
  branches,
} from "@/db/schema/settings/branches";

import {
  warehouses,
} from "@/db/schema/settings/warehouses";

import {
  fiscalYears,
} from "@/db/schema/settings/fiscal_years";


export async function provisionBusinessSettings(
  businessId: string
) {

  console.log(
    "Provisioning business settings..."
  );


  const existing =
    await db.query.businessSettings.findFirst({
      where: eq(
        businessSettings.businessId,
        businessId
      ),
    });


  if (existing) {

    console.log(
      "Business settings already exist"
    );

    return existing;

  }


  const currency =
    await db.query.currencies.findFirst({
      where: eq(
        currencies.code,
        "KES"
      ),
    });


  if (!currency) {
    throw new Error(
      "Default currency KES not found"
    );
  }



  const paymentMethod =
    await db.query.paymentMethods.findFirst({
      where: eq(
        paymentMethods.code,
        "CASH"
      ),
    });


  if (!paymentMethod) {
    throw new Error(
      "Default payment method CASH not found"
    );
  }



  const taxRate =
    await db.query.taxRates.findFirst({
      where: eq(
        taxRates.code,
        "VAT16"
      ),
    });


  if (!taxRate) {
    throw new Error(
      "Default tax rate VAT16 not found"
    );
  }



  const branch =
    await db.query.branches.findFirst({
      where: and(
        eq(
          branches.businessId,
          businessId
        ),

        eq(
          branches.isHeadOffice,
          true
        )
      ),
    });


  if (!branch) {
    throw new Error(
      "Default branch not found"
    );
  }



  const warehouse =
    await db.query.warehouses.findFirst({
      where: and(
        eq(
          warehouses.businessId,
          businessId
        ),

        eq(
          warehouses.branchId,
          branch.id
        )
      ),
    });


  if (!warehouse) {
    throw new Error(
      "Default warehouse not found"
    );
  }



  const fiscalYear =
    await db.query.fiscalYears.findFirst({
      where: and(
        eq(
          fiscalYears.businessId,
          businessId
        ),

        eq(
          fiscalYears.isCurrent,
          true
        )
      ),
    });



  if (!fiscalYear) {
    throw new Error(
      "Current fiscal year not found"
    );
  }



  const [
    settings
  ] =
    await db
      .insert(businessSettings)
      .values({

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

      })
      .returning();


  console.log(
    "Created business settings"
  );


  return settings;

}