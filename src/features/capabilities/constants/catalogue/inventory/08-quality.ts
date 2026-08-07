import type {
  CapabilityDefinition,
} from "../../../types";

export const QUALITY_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.quality-checks",

    code: "QUALITY_CHECKS",

    name: "Quality Checks",

    description:
      "Perform quality verification before inventory becomes available.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "FOOD",
      "LABORATORY",
      "MANUFACTURING",
      "AGROVET",
    ],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [],

    schema: [
      "quality_checks",
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "goods-receipt",
      "quality-checks",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [
      "quality-check-required",
    ],

    permissions: [
      "inventory.quality.manage",
    ],

    featureFlags: [
      "inventory.quality-checks",
    ],
  },


  {
    id: "inventory.quarantine-stock",

    code: "QUARANTINE_STOCK",

    name: "Quarantine Stock",

    description:
      "Hold inventory that requires inspection before release.",

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
      "inventory.quality-checks",
    ],

    conflicts: [],

    schema: [
      "inventory_balances",
      "stock_movements",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "quarantine",
    ],

    workflows: [
      "stock.quarantine",
      "stock.release",
    ],

    validators: [],

    permissions: [
      "inventory.quality.manage",
    ],

    featureFlags: [
      "inventory.quarantine-stock",
    ],
  },


  {
    id: "inventory.damaged-stock",

    code: "DAMAGED_STOCK",

    name: "Damaged Stock",

    description:
      "Track damaged products separately from available inventory.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "inventory_balances",
      "stock_movements",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "inventory-adjustments",
    ],

    workflows: [
      "stock.adjust",
    ],

    validators: [
      "damage-reason-required",
    ],

    permissions: [
      "inventory.stock.adjust",
    ],

    featureFlags: [
      "inventory.damaged-stock",
    ],
  },


  {
    id: "inventory.stock-status",

    code: "STOCK_STATUS",

    name: "Stock Status",

    description:
      "Classify stock by operational status.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
      "inventory-dashboard",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "inventory.products.view",
    ],

    featureFlags: [
      "inventory.stock-status",
    ],
  },


];