import type {
  CreateProductInput,
} from "../schemas/products";

import {
  PRODUCT_TYPES,
  type ProductFieldDefinition,
  type ProductRuleSet,
  type ProductStepDefinition,
  type ProductType,
} from "../types";

export const PRODUCT_CAPABILITY_RULES: Array<{
  capability: string;
  productTypes: ProductType[];
}> = [
  { capability: "inventory.product-types", productTypes: [...PRODUCT_TYPES] },
  { capability: "inventory.batch-control", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { capability: "inventory.expiry-control", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { capability: "inventory.serial-numbers", productTypes: ["physical", "finished-product"] },
  { capability: "inventory.reorder-level", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { capability: "pharmacy.core", productTypes: ["medicine"] },
  { capability: "pharmacy.medicine-catalogue", productTypes: ["medicine"] },
];

export const PRODUCT_FIELD_DEFINITIONS: ProductFieldDefinition[] = [
  { key: "productType", label: "Product Type", step: "classification", productTypes: [...PRODUCT_TYPES], required: true },
  { key: "categoryId", label: "Category", step: "classification", productTypes: [...PRODUCT_TYPES], required: true },
  { key: "name", label: "Name", step: "product-information", productTypes: [...PRODUCT_TYPES], required: true },
  { key: "description", label: "Description", step: "product-information", productTypes: [...PRODUCT_TYPES] },
  { key: "sku", label: "SKU", step: "product-information", productTypes: [...PRODUCT_TYPES] },
  { key: "barcode", label: "Barcode", step: "product-information", productTypes: [...PRODUCT_TYPES] },
  { key: "productBrand", label: "Brand", step: "product-information", productTypes: [...PRODUCT_TYPES] },
  { key: "costPrice", label: "Cost Price", step: "pricing", productTypes: [...PRODUCT_TYPES] },
  { key: "purchaseUnitId", label: "Purchase Unit", step: "units", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { key: "salesUnitId", label: "Sales Unit", step: "units", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { key: "stockUnitId", label: "Stock Unit", step: "units", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { key: "trackInventory", label: "Track Inventory", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"], required: true },
  { key: "minimumStock", label: "Minimum Stock", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"], capability: "inventory.reorder-level" },
  { key: "reorderLevel", label: "Reorder Level", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"], capability: "inventory.reorder-level" },
  { key: "allowNegativeStock", label: "Allow Negative Stock", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { key: "trackBatch", label: "Track Batch", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"], capability: "inventory.batch-control", required: true },
  { key: "trackExpiry", label: "Track Expiry", step: "inventory", productTypes: ["physical", "medicine", "raw-material", "finished-product"], capability: "inventory.expiry-control", required: true },
  { key: "serialized", label: "Serialised", step: "inventory", productTypes: ["physical", "finished-product"], capability: "inventory.serial-numbers" },
  { key: "genericName", label: "Generic Name", step: "pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue", required: true },
  { key: "drugCategoryId", label: "Drug Category", step: "pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue", required: true },
  { key: "dosageFormId", label: "Dosage Form", step: "pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue", required: true },
  { key: "drugStrengthId", label: "Drug Strength", step: "pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue", required: true },
  { key: "prescriptionTypeId", label: "Prescription Type", step: "pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue", required: true },
  { key: "manufacturerId", label: "Manufacturer", step: "classification", productTypes: ["medicine", "physical", "raw-material", "finished-product"] },
  { key: "supplierId", label: "Supplier", step: "classification", productTypes: [...PRODUCT_TYPES] },
  { key: "taxRateId", label: "Tax Rate", step: "accounting", productTypes: [...PRODUCT_TYPES] },
  { key: "incomeAccountId", label: "Income Account", step: "accounting", productTypes: [...PRODUCT_TYPES] },
  { key: "expenseAccountId", label: "Expense Account", step: "accounting", productTypes: [...PRODUCT_TYPES] },
  { key: "inventoryAccountId", label: "Inventory Account", step: "accounting", productTypes: [...PRODUCT_TYPES] },
];

export const PRODUCT_STEP_DEFINITIONS: ProductStepDefinition[] = [
  { id: "product-information", title: "Basics", productTypes: [...PRODUCT_TYPES] },
  { id: "classification", title: "Category", productTypes: [...PRODUCT_TYPES] },
  { id: "units", title: "Units", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { id: "pricing", title: "Pricing", productTypes: [...PRODUCT_TYPES] },
  { id: "inventory", title: "Tracking", productTypes: ["physical", "medicine", "raw-material", "finished-product"] },
  { id: "pharmacy", title: "Pharmacy", productTypes: ["medicine"], capability: "pharmacy.medicine-catalogue" },
  { id: "accounting", title: "Accounts", productTypes: [...PRODUCT_TYPES] },
];

export class ProductRuleResolver {
  resolve({
    businessCapabilities,
    productType,
  }: {
    businessCapabilities: string[];
    productType: ProductType;
  }): ProductRuleSet {
    const enabledCapabilitySet = new Set(businessCapabilities);

    const applicableCapabilities = PRODUCT_CAPABILITY_RULES
      .filter((rule) => rule.productTypes.includes(productType))
      .map((rule) => rule.capability)
      .filter((capability) => enabledCapabilitySet.has(capability));

    const fields = PRODUCT_FIELD_DEFINITIONS.filter(
      (field) => field.productTypes.includes(productType) && (!field.capability || enabledCapabilitySet.has(field.capability)),
    );

    const requiredFields = fields
      .filter((field) => field.required)
      .map((field) => field.key);

    const steps = PRODUCT_STEP_DEFINITIONS.filter(
      (step) => step.productTypes.includes(productType) && (!step.capability || enabledCapabilitySet.has(step.capability)),
    );

    return {
      productType,
      enabledCapabilities: Array.from(enabledCapabilitySet).sort(),
      applicableCapabilities,
      fields,
      requiredFields,
      steps,
    };
  }

  resolveForBusiness({
    businessCapabilities,
  }: {
    businessCapabilities: string[];
  }): Partial<Record<ProductType, ProductRuleSet>> {
    return PRODUCT_TYPES.reduce((result, productType) => {
      result[productType] = this.resolve({
        businessCapabilities,
        productType,
      });
      return result;
    }, {} as Partial<Record<ProductType, ProductRuleSet>>);
  }

  validateInput({
    businessCapabilities,
    input,
  }: {
    businessCapabilities: string[];
    input: CreateProductInput;
  }): { valid: boolean; errors: Record<string, string[]> } {
    const ruleSet = this.resolve({
      businessCapabilities,
      productType: input.productType,
    });

    const errors: Record<string, string[]> = {};
    const setError = (key: string, message: string) => {
      const current = errors[key] ?? [];
      current.push(message);
      errors[key] = current;
    };

    const required = ruleSet.requiredFields;
    for (const field of required) {
      const value = input[field as keyof CreateProductInput];
      const isEmpty = value === null || value === undefined || value === "";

      if (isEmpty) {
        setError(field, `${field} is required for ${input.productType}.`);
      }
    }

    if (input.productType === "medicine" && !businessCapabilities.includes("pharmacy.medicine-catalogue")) {
      setError("productType", "Medicine products require the pharmacy.medicine-catalogue capability.");
    }

    if (input.trackBatch && !businessCapabilities.includes("inventory.batch-control")) {
      setError("trackBatch", "Batch tracking requires inventory.batch-control.");
    }

    if (input.trackExpiry && !businessCapabilities.includes("inventory.expiry-control")) {
      setError("trackExpiry", "Expiry tracking requires inventory.expiry-control.");
    }

    if (input.serialized && !businessCapabilities.includes("inventory.serial-numbers")) {
      setError("serialized", "Serialized products require inventory.serial-numbers.");
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Product types the business may create, based on enabled capabilities.
   * Medicine only appears when pharmacy capabilities are on.
   */
  availableProductTypes(businessCapabilities: string[]): ProductType[] {
    const enabled = new Set(businessCapabilities);
    const types: ProductType[] = [
      "physical",
      "service",
      "raw-material",
      "finished-product",
    ];

    if (
      enabled.has("pharmacy.core") ||
      enabled.has("pharmacy.medicine-catalogue")
    ) {
      types.splice(2, 0, "medicine");
    }

    return types;
  }
}

export const productRuleResolver = new ProductRuleResolver();
