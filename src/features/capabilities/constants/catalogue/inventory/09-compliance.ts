import type {
  CapabilityDefinition,
} from "../../../types";

export const COMPLIANCE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.expiry-alerts",

    code: "EXPIRY_ALERTS",

    name: "Expiry Alerts",

    description:
      "Notify users about products approaching expiry.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "FOOD",
      "SUPERMARKET",
      "AGROVET",
    ],

    defaultEnabled: false,

    dependencies: [
      "inventory.expiry-control",
    ],

    conflicts: [],

    schema: [
      "product_batches",
    ],

    services: [
      "inventory",
      "notifications",
    ],

    ui: [
      "inventory-dashboard",
      "alerts",
    ],

    workflows: [
      "expiry.monitor",
    ],

    validators: [],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "inventory.expiry-alerts",
    ],
  },


  {
    id: "inventory.recall-management",

    code: "RECALL_MANAGEMENT",

    name: "Product Recall Management",

    description:
      "Identify and remove affected inventory batches.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "FOOD",
      "LABORATORY",
      "AGROVET",
    ],

    defaultEnabled: false,

    dependencies: [
      "inventory.batch-control",
    ],

    conflicts: [],

    schema: [
      "product_batches",
      "stock_movements",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "recalls",
    ],

    workflows: [
      "stock.recall",
    ],

    validators: [
      "batch-trace-required",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.recall-management",
    ],
  },


  {
    id: "inventory.traceability",

    code: "TRACEABILITY",

    name: "Inventory Traceability",

    description:
      "Trace products from receiving to final sale.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "FOOD",
      "LABORATORY",
      "MANUFACTURING",
    ],

    defaultEnabled: false,

    dependencies: [
      "inventory.batch-control",
    ],

    conflicts: [],

    schema: [
      "stock_movements",
      "product_batches",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "traceability-report",
    ],

    workflows: [
      "purchase.receive",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "product_batches.view",
    ],

    featureFlags: [
      "inventory.traceability",
    ],
  },


  {
    id: "inventory.controlled-items",

    code: "CONTROLLED_ITEMS",

    name: "Controlled Items",

    description:
      "Apply additional controls to regulated products.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "LABORATORY",
    ],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
      "stock_movements",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
      "sales",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [
      "controlled-item-approval",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.controlled-items",
    ],
  },


];