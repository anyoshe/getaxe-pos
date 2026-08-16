import type {
  CapabilityDefinition,
} from "../../../types";


export const SUPPLIER_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "purchasing.supplier-management",

    code: "SUPPLIER_MANAGEMENT",

    name: "Supplier Management",

    description:
      "Manage supplier profiles and relationships.",

    module: "PURCHASING",

    group: "SUPPLIERS",

    category: "SUPPLIER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "suppliers",
    ],

    services: [
      "purchasing",
    ],

    ui: [
      "suppliers",
    ],

    workflows: [
      "supplier.create",
      "supplier.update",
    ],

    validators: [
      "supplier-name-required",
    ],

    permissions: [
      "suppliers.update",
    ],

    featureFlags: [
      "purchasing.supplier-management",
    ],
  },


  {
    id: "purchasing.supplier-categories",

    code: "SUPPLIER_CATEGORIES",

    name: "Supplier Categories",

    description:
      "Classify suppliers into categories.",

    module: "PURCHASING",

    group: "SUPPLIERS",

    category: "SUPPLIER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-management",
    ],

    conflicts: [],

    schema: [
      "suppliers",
    ],

    services: [
      "purchasing",
    ],

    ui: [
      "supplier-categories",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "suppliers.update",
    ],

    featureFlags: [
      "purchasing.supplier-categories",
    ],
  },


  {
    id: "purchasing.supplier-pricing",

    code: "SUPPLIER_PRICING",

    name: "Supplier Pricing",

    description:
      "Maintain supplier-specific purchase prices.",

    module: "PURCHASING",

    group: "SUPPLIERS",

    category: "SUPPLIER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-management",
    ],

    conflicts: [],

    schema: [
      "suppliers",
      "product_prices",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "supplier-pricing",
    ],

    workflows: [
      "purchase.calculate-cost",
    ],

    validators: [],

    permissions: [
      "suppliers.update",
    ],

    featureFlags: [
      "purchasing.supplier-pricing",
    ],
  },


  {
    id: "purchasing.supplier-performance",

    code: "SUPPLIER_PERFORMANCE",

    name: "Supplier Performance",

    description:
      "Track supplier delivery and purchase performance.",

    module: "PURCHASING",

    group: "SUPPLIERS",

    category: "SUPPLIER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-management",
    ],

    conflicts: [],

    schema: [
      "suppliers",
      "goods_receipts",
      "purchase_orders",
    ],

    services: [
      "purchasing",
      "reporting",
    ],

    ui: [
      "supplier-performance",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "suppliers.view",
    ],

    featureFlags: [
      "purchasing.supplier-performance",
    ],
  },


];