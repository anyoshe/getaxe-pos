import type {
  CapabilityDefinition,
} from "../../../types";

export const MEASUREMENT_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.multi-uom",

    code: "MULTI_UOM",

    name: "Multiple Units of Measure",

    description:
      "Support purchase, stock and sales units with automatic conversions.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
      "units",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "products",
      "units",
    ],

    workflows: [
      "product.create",
      "purchase.receive",
      "sales.complete",
    ],

    validators: [
      "unit-conversion",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.multi-uom",
    ],
  },

  {
    id: "inventory.purchase-unit",

    code: "PURCHASE_UNIT",

    name: "Purchase Unit",

    description:
      "Define purchasing unit of measure.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.multi-uom",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
      "purchasing",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "product.create",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.purchase-unit",
    ],
  },

  {
    id: "inventory.sales-unit",

    code: "SALES_UNIT",

    name: "Sales Unit",

    description:
      "Define selling unit of measure.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.multi-uom",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "product.create",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.sales-unit",
    ],
  },

  {
    id: "inventory.stock-unit",

    code: "STOCK_UNIT",

    name: "Stock Unit",

    description:
      "Maintain inventory in a base stock unit.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.multi-uom",
    ],

    conflicts: [],

    schema: [
      "products",
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "purchase.receive",
      "sales.complete",
      "stock.transfer",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.stock-unit",
    ],
  },

  {
    id: "inventory.unit-conversion",

    code: "UNIT_CONVERSION",

    name: "Unit Conversion",

    description:
      "Automatically convert quantities between units.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.multi-uom",
    ],

    conflicts: [],

    schema: [
      "products",
      "units",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "products",
      "units",
    ],

    workflows: [
      "purchase.receive",
      "sales.complete",
    ],

    validators: [
      "unit-conversion",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.unit-conversion",
    ],
  },

];