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

export class ProductContextService {
  async getContext(
    businessId: string,
  ): Promise<ProductContext> {
    const [
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
      taxRates: [],
      incomeAccounts: [],
      expenseAccounts: [],
      inventoryAccounts: [],
    };
  }
}

export const productContextService = new ProductContextService();
