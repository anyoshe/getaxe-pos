import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_PROFILE,
  HARDWARE_PROFILE,
  PHARMACY_PROFILE,
  SUPERMARKET_PROFILE,
} from "../capabilities/profiles";
import {
  CapabilityResolver,
} from "../capabilities/services/capability-resolver";
import { productRuleResolver } from "./services/product-rule-resolver";

test("default capabilities resolve correctly", () => {
  const resolver = new CapabilityResolver();
  const resolved = resolver.resolve(DEFAULT_PROFILE);

  assert.ok(resolved.some((capability) => capability.id === "inventory.product-types"));
  assert.ok(resolved.some((capability) => capability.id === "sales.pos"));
});

test("explicit capabilities resolve correctly and include dependencies", () => {
  const resolver = new CapabilityResolver();
  const resolved = resolver.resolve(PHARMACY_PROFILE);

  assert.ok(resolved.some((capability) => capability.id === "pharmacy.core"));
  assert.ok(resolved.some((capability) => capability.id === "pharmacy.medicine-catalogue"));
  assert.ok(resolved.some((capability) => capability.id === "inventory.batch-control"));
  assert.ok(resolved.some((capability) => capability.id === "inventory.expiry-control"));
});

test("unknown capability IDs fail", () => {
  const resolver = new CapabilityResolver();

  assert.throws(() => {
    resolver.resolve({
      id: "broken",
      name: "Broken",
      businessType: "PHARMACY",
      description: "Broken profile",
      enabled: ["not.real"],
      disabled: [],
    });
  }, /Unknown capability ID requested/);
});

test("circular dependencies fail", () => {
  const circularRegistry = {
    all: () => [
      {
        id: "a",
        code: "A",
        name: "A",
        description: "A",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: ["b"],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
      {
        id: "b",
        code: "B",
        name: "B",
        description: "B",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: ["a"],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
    ],
    exists: (id: string) => id === "a" || id === "b",
    get: (id: string) => ({
      a: {
        id: "a",
        code: "A",
        name: "A",
        description: "A",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: ["b"],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
      b: {
        id: "b",
        code: "B",
        name: "B",
        description: "B",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: ["a"],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
    }[id]),
  } as any;

  const resolver = new CapabilityResolver(circularRegistry);

  assert.throws(() => resolver.resolve({
    id: "circular",
    name: "Circular",
    businessType: "PHARMACY",
    description: "Circular dependencies",
    enabled: ["a"],
    disabled: [],
  }), /Circular dependency detected/);
});

test("conflicts are detected", () => {
  const conflictRegistry = {
    all: () => [
      {
        id: "a",
        code: "A",
        name: "A",
        description: "A",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: [],
        conflicts: ["b"],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
      {
        id: "b",
        code: "B",
        name: "B",
        description: "B",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: [],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
    ],
    exists: (id: string) => id === "a" || id === "b",
    get: (id: string) => ({
      a: {
        id: "a",
        code: "A",
        name: "A",
        description: "A",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: [],
        conflicts: ["b"],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
      b: {
        id: "b",
        code: "B",
        name: "B",
        description: "B",
        module: "CORE",
        group: "CORE",
        category: "CORE",
        status: "ACTIVE",
        industries: [],
        defaultEnabled: false,
        dependencies: [],
        conflicts: [],
        schema: [],
        services: [],
        ui: [],
        workflows: [],
        validators: [],
        permissions: [],
        featureFlags: [],
      },
    }[id]),
  } as any;

  const resolver = new CapabilityResolver(conflictRegistry);

  assert.throws(() => resolver.resolve({
    id: "conflict",
    name: "Conflict",
    businessType: "PHARMACY",
    description: "Conflict profile",
    enabled: ["a", "b"],
    disabled: [],
  }), /Capability conflict detected/);
});

test("disabled dependencies cannot leave an invalid graph", () => {
  const resolver = new CapabilityResolver();

  assert.throws(() => resolver.resolve({
    id: "invalid",
    name: "Invalid",
    businessType: "PHARMACY",
    description: "Disabled dependency",
    enabled: ["pharmacy.medicine-catalogue"],
    disabled: ["pharmacy.core"],
  }), /depends on disabled capability/);
});

test("duplicate profile entries do not create duplicate resolved capabilities", () => {
  const resolver = new CapabilityResolver();
  const resolved = resolver.resolve(PHARMACY_PROFILE);
  const ids = resolved.map((capability) => capability.id);

  assert.equal(new Set(ids).size, ids.length);
});

test("physical product gets universal product fields", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "physical",
  });

  assert.ok(resolved.fields.some((field) => field.key === "name"));
  assert.ok(resolved.fields.some((field) => field.key === "categoryId"));
  assert.ok(!resolved.fields.some((field) => field.key === "genericName"));
});

test("service product does not get inventory-only fields", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "sales.pos"],
    productType: "service",
  });

  assert.ok(!resolved.fields.some((field) => field.key === "trackBatch"));
  assert.ok(!resolved.fields.some((field) => field.key === "serialized"));
});

test("medicine gets pharmacy-specific fields only when pharmacy capability is enabled", () => {
  const enabled = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "pharmacy.core", "pharmacy.medicine-catalogue"],
    productType: "medicine",
  });
  const disabled = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "medicine",
  });

  assert.ok(enabled.fields.some((field) => field.key === "genericName"));
  assert.ok(!disabled.fields.some((field) => field.key === "genericName"));
});

test("serialized products get serialisation rules only when applicable", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "inventory.serial-numbers"],
    productType: "physical",
  });

  assert.ok(resolved.fields.some((field) => field.key === "serialized"));
  assert.ok(!productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "service",
  }).fields.some((field) => field.key === "serialized"));
});

test("batch and expiry controlled products get the related rules", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "inventory.batch-control", "inventory.expiry-control"],
    productType: "medicine",
  });

  assert.ok(resolved.fields.some((field) => field.key === "trackBatch"));
  assert.ok(resolved.fields.some((field) => field.key === "trackExpiry"));
});

test("required fields are correctly determined", () => {
  const resolved = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "pharmacy.core", "pharmacy.medicine-catalogue"],
    productType: "medicine",
  });

  assert.ok(resolved.requiredFields.includes("name"));
  assert.ok(resolved.requiredFields.includes("genericName"));
  assert.ok(resolved.requiredFields.includes("categoryId"));
});

test("runtime rules use current business capabilities and changing capabilities changes results", () => {
  const base = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types"],
    productType: "medicine",
  });
  const upgraded = productRuleResolver.resolve({
    businessCapabilities: ["inventory.product-types", "pharmacy.core", "pharmacy.medicine-catalogue"],
    productType: "medicine",
  });

  assert.ok(!base.fields.some((field) => field.key === "genericName"));
  assert.ok(upgraded.fields.some((field) => field.key === "genericName"));
});

test("server-side validation rejects invalid medicine combinations", () => {
  const validation = productRuleResolver.validateInput({
    businessCapabilities: ["inventory.product-types", "pharmacy.core", "pharmacy.medicine-catalogue"],
    input: {
      productType: "medicine",
      categoryId: "123e4567-e89b-12d3-a456-426614174000",
      supplierId: null,
      manufacturerId: null,
      drugCategoryId: null,
      dosageFormId: null,
      drugStrengthId: null,
      prescriptionTypeId: null,
      purchaseUnitId: null,
      salesUnitId: null,
      stockUnitId: null,
      incomeAccountId: null,
      expenseAccountId: null,
      inventoryAccountId: null,
      taxRateId: null,
      name: "Test medicine",
      genericName: "",
      productBrand: null,
      description: null,
      sku: null,
      barcode: null,
      packSize: null,
      costPrice: null,
      trackInventory: true,
      trackBatch: false,
      trackExpiry: false,
      serialized: false,
      allowNegativeStock: false,
      minimumStock: 0,
      reorderLevel: 0,
      active: true,
    },
  });

  assert.equal(validation.valid, false);
  assert.ok(validation.errors.genericName);
});

test("business type is not directly required by the product rule layer", () => {
  const pharmacyResult = productRuleResolver.resolve({
    businessCapabilities: PHARMACY_PROFILE.enabled,
    productType: "medicine",
  });
  const hardwareResult = productRuleResolver.resolve({
    businessCapabilities: HARDWARE_PROFILE.enabled,
    productType: "physical",
  });

  assert.ok(pharmacyResult.steps.some((step) => step.id === "pharmacy"));
  assert.ok(hardwareResult.steps.some((step) => step.id === "inventory"));
  assert.ok(!hardwareResult.steps.some((step) => step.id === "pharmacy"));
});
