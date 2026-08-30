import {
  categoryRepository,
} from "@/repositories/inventory/categories.repository";

import {
  supplierRepository,
} from "@/repositories/inventory/suppliers.repository";

import {
  unitsRepository,
} from "@/repositories/settings/units.repository";

import {
  pharmacyReferenceRepository,
} from "@/repositories/pharmacy/reference-data.repository";

import {
  BusinessCapabilityRepository,
} from "@/features/capabilities/repositories";

import type {
  ProductContext,
} from "../types";

import {
  PRODUCT_TYPES,
} from "../types";

import {
  productRuleResolver,
} from "./product-rule-resolver";

import { seedDefaultProductCategories } from "@/features/inventory/services/seed-default-product-categories.service";
import { seedPharmacyCataloguesForBusiness } from "@/features/pharmacy/services/seed-pharmacy-catalogues.service";
import { financeService } from "@/features/finance/services/finance.service";

export class ProductContextService {
  async getContext(
    businessId: string,
  ): Promise<ProductContext> {
    let [
      categories,
      suppliers,
      units,
      capabilities,
      manufacturers,
      dosageForms,
      drugCategories,
      drugStrengths,
      prescriptionTypes,
    ] = await Promise.all([
      categoryRepository.findAll(businessId),
      supplierRepository.findAll(businessId),
      unitsRepository.findAll(businessId),
      new BusinessCapabilityRepository().listEnabled(businessId),
      pharmacyReferenceRepository.listManufacturers(businessId),
      pharmacyReferenceRepository.listDosageForms(businessId),
      pharmacyReferenceRepository.listDrugCategories(businessId),
      pharmacyReferenceRepository.listDrugStrengths(businessId),
      pharmacyReferenceRepository.listPrescriptionTypes(businessId),
    ]);

    // Auto-seed pharmacy defaults when medicine capabilities are on but catalogues empty
    const hasPharmacyCap = capabilities.some((c) => c.startsWith("pharmacy."));
    if (
      hasPharmacyCap &&
      (dosageForms.length === 0 ||
        drugCategories.length === 0 ||
        drugStrengths.length === 0 ||
        prescriptionTypes.length === 0)
    ) {
      await seedPharmacyCataloguesForBusiness(businessId, "PHARMACY");
      const refreshed = await Promise.all([
        pharmacyReferenceRepository.listDosageForms(businessId),
        pharmacyReferenceRepository.listDrugCategories(businessId),
        pharmacyReferenceRepository.listDrugStrengths(businessId),
        pharmacyReferenceRepository.listPrescriptionTypes(businessId),
      ]);
      dosageForms = refreshed[0];
      drugCategories = refreshed[1];
      drugStrengths = refreshed[2];
      prescriptionTypes = refreshed[3];
    }

    if (categories.length === 0) {
      const typeGuess = hasPharmacyCap ? "PHARMACY" : "OTHER";
      await seedDefaultProductCategories(businessId, typeGuess);
      categories = await categoryRepository.findAll(businessId);
    }

    const productRulesByType = PRODUCT_TYPES.reduce((result, productType) => {
      result[productType] = productRuleResolver.resolve({
        businessCapabilities: capabilities,
        productType,
      });
      return result;
    }, {} as ProductContext["productRulesByType"]);

    const applicableFields = PRODUCT_TYPES.flatMap((productType) =>
      productRulesByType[productType]?.fields ?? [],
    );

    const applicableSteps = PRODUCT_TYPES.flatMap((productType) =>
      productRulesByType[productType]?.steps ?? [],
    );

    return {
      capabilities,
      businessCapabilities: capabilities,
      productTypes: [...PRODUCT_TYPES],
      productRulesByType,
      applicableFields,
      applicableSteps,
      categories,
      suppliers,
      units,
      manufacturers,
      dosageForms,
      drugCategories,
      drugStrengths,
      prescriptionTypes,
      taxRates: await financeService.getTaxRates(businessId).catch(() => []),
      ...(await financeService
        .getAccountsForProductContext(businessId)
        .catch(() => ({
          incomeAccounts: [],
          expenseAccounts: [],
          inventoryAccounts: [],
        }))),
    };
  }
}

export const productContextService = new ProductContextService();
