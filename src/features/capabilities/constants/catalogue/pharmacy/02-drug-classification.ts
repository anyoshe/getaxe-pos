import type {
  CapabilityDefinition,
} from "../../../types";


export const DRUG_CLASSIFICATION_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "pharmacy.drug-categories",

    code: "DRUG_CATEGORIES",

    name: "Drug Categories",

    description:
      "Classify medicines by therapeutic category.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
      "CLINIC",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "drug_categories",
      "products",
    ],

    services: [
      "pharmacy",
    ],

    ui: [
      "drug-categories",
    ],

    workflows: [
      "medicine.classify",
    ],

    validators: [],

    permissions: [
      "pharmacy.categories.manage",
    ],

    featureFlags: [
      "pharmacy.drug-categories",
    ],
  },


  {
    id: "pharmacy.active-ingredients",

    code: "ACTIVE_INGREDIENTS",

    name: "Active Ingredients",

    description:
      "Manage active pharmaceutical ingredients in medicines.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "active_ingredients",
      "products",
    ],

    services: [
      "pharmacy",
    ],

    ui: [
      "active-ingredients",
    ],

    workflows: [
      "medicine.ingredient-manage",
    ],

    validators: [
      "ingredient-required",
    ],

    permissions: [
      "pharmacy.ingredients.manage",
    ],

    featureFlags: [
      "pharmacy.active-ingredients",
    ],
  },


  {
    id: "pharmacy.generic-brand-management",

    code: "GENERIC_BRAND_MANAGEMENT",

    name: "Generic and Brand Medicines",

    description:
      "Support generic medicines and branded equivalents.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "HOSPITAL",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "pharmacy",
      "inventory",
    ],

    ui: [
      "medicine-products",
    ],

    workflows: [
      "medicine.link-generic",
    ],

    validators: [],

    permissions: [
      "pharmacy.medicines.manage",
    ],

    featureFlags: [
      "pharmacy.generic-brand-management",
    ],
  },


  {
    id: "pharmacy.controlled-medicines",

    code: "CONTROLLED_MEDICINES",

    name: "Controlled Medicines",

    description:
      "Manage medicines requiring special control and tracking.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "HOSPITAL",
    ],

    defaultEnabled: false,

    dependencies: [
      "pharmacy.medicine-catalogue",
      "inventory.serial-numbers",
    ],

    conflicts: [],

    schema: [
      "products",
      "product_batches",
    ],

    services: [
      "pharmacy",
      "inventory",
    ],

    ui: [
      "controlled-medicines",
    ],

    workflows: [
      "controlled-medicine.dispense",
    ],

    validators: [
      "controlled-medicine-authorization",
    ],

    permissions: [
      "pharmacy.controlled.manage",
    ],

    featureFlags: [
      "pharmacy.controlled-medicines",
    ],
  },


];