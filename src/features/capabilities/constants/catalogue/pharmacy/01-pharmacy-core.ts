import type {
  CapabilityDefinition,
} from "../../../types";


export const PHARMACY_CORE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "products.update",

    code: "PHARMACY_CORE",

    name: "Pharmacy Management",

    description:
      "Enable pharmacy-specific inventory and sales operations.",

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
      "inventory.batch-control",
      "inventory.expiry-control",
      "sales.pos",
    ],

    conflicts: [],

    schema: [
      "products",
      "product_batches",
      "sales",
    ],

    services: [
      "inventory",
      "sales",
      "pharmacy",
    ],

    ui: [
      "pharmacy-dashboard",
      "pharmacy-products",
      "pharmacy-sales",
    ],

    workflows: [
      "medicine.sale",
      "medicine.stock-check",
    ],

    validators: [
      "medicine-required",
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

    code: "MEDICINE_CATALOGUE",

    name: "Medicine Catalogue",

    description:
      "Manage medicines with pharmacy-specific information.",

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
      "medicine-catalogue",
    ],

    workflows: [
      "medicine.create",
      "medicine.update",
    ],

    validators: [
      "medicine-name-required",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


];