import type {
  CapabilityDefinition,
} from "../../../types";


export const DRUG_CLASSIFICATION_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "products.update",

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
      "products.update",
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
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

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
      "products.update",
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
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

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
      "products.update",
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
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

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
      "products.update",
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
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


];