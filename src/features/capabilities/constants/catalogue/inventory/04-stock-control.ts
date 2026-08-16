import type {
  CapabilityDefinition,
} from "../../../types";

export const STOCK_CONTROL_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.batch-control",

    code: "BATCH_CONTROL",

    name: "Batch Control",

    description:
      "Track inventory using production batches.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "SUPERMARKET",
      "FOOD",
      "CHEMIST",
      "LABORATORY",
      "AGROVET",
    ],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [
      "inventory.serial-numbers",
    ],

    schema: [
      "product_batches",
      "inventory_balances",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "products",
      "goods-receipt",
      "sales",
    ],

    workflows: [
      "purchase.receive",
      "sales.complete",
    ],

    validators: [
      "batch-required",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.batch",
    ],
  },

  {
    id: "inventory.expiry-control",

    code: "EXPIRY_CONTROL",

    name: "Expiry Control",

    description:
      "Track expiry dates for inventory.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "FOOD",
      "SUPERMARKET",
      "CHEMIST",
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
      "purchase.receive",
      "sales.complete",
    ],

    validators: [
      "expiry-required",
      "expiry-validation",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.expiry",
    ],
  },

  {
    id: "inventory.manufacturing-date",

    code: "MANUFACTURING_DATE",

    name: "Manufacturing Date",

    description:
      "Store manufacturing date for each batch.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.batch-control",
    ],

    conflicts: [],

    schema: [
      "product_batches",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.manufacturing-date",
    ],
  },

  {
    id: "inventory.shelf-life",

    code: "SHELF_LIFE",

    name: "Shelf Life",

    description:
      "Automatically calculate expiry from shelf life.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.expiry-control",
    ],

    conflicts: [],

    schema: [
      "products",
      "product_batches",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.shelf-life",
    ],
  },

    {
    id: "inventory.negative-stock",

    code: "NEGATIVE_STOCK",

    name: "Negative Stock",

    description:
      "Allow inventory quantities to go below zero.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [],

    schema: [
      "inventory_balances",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "business-settings",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "business_settings.update",
    ],

    featureFlags: [
      "inventory.negative-stock",
    ],
  },

  {
    id: "inventory.reserved-stock",

    code: "RESERVED_STOCK",

    name: "Reserved Stock",

    description:
      "Reserve stock for quotations, orders and allocations.",

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
      "sales",
    ],

    ui: [
      "products",
      "sales",
    ],

    workflows: [
      "stock.allocate",
      "stock.release",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.reserved-stock",
    ],
  },

  {
    id: "inventory.available-stock",

    code: "AVAILABLE_STOCK",

    name: "Available Stock",

    description:
      "Calculate available stock after reservations.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.reserved-stock",
    ],

    conflicts: [],

    schema: [
      "inventory_balances",
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

    validators: [],

    permissions: [
      "products.view",
    ],

    featureFlags: [
      "inventory.available-stock",
    ],
  },

  {
    id: "inventory.reorder-level",

    code: "REORDER_LEVEL",

    name: "Reorder Level",

    description:
      "Notify when stock falls below the reorder point.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

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
      "dashboard",
    ],

    workflows: [
      "stock.monitor",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.reorder-level",
    ],
  },

  {
    id: "inventory.minimum-stock",

    code: "MINIMUM_STOCK",

    name: "Minimum Stock",

    description:
      "Define minimum stock levels.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "stock.monitor",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.minimum-stock",
    ],
  },

  {
    id: "inventory.maximum-stock",

    code: "MAXIMUM_STOCK",

    name: "Maximum Stock",

    description:
      "Define maximum stock levels.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "stock.monitor",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.maximum-stock",
    ],
  },

  {
    id: "inventory.safety-stock",

    code: "SAFETY_STOCK",

    name: "Safety Stock",

    description:
      "Maintain a safety buffer to reduce stock-outs.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.minimum-stock",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "stock.monitor",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.safety-stock",
    ],
  },

    {
    id: "inventory.consignment-stock",

    code: "CONSIGNMENT_STOCK",

    name: "Consignment Stock",

    description:
      "Manage stock owned by suppliers until sold.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [],

    schema: [
      "inventory_balances",
    ],

    services: [
      "inventory",
      "purchasing",
      "sales",
    ],

    ui: [
      "products",
      "goods-receipt",
    ],

    workflows: [
      "purchase.receive",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.consignment-stock",
    ],
  },

  {
    id: "inventory.in-transit-stock",

    code: "IN_TRANSIT_STOCK",

    name: "In Transit Stock",

    description:
      "Track inventory currently being transferred between locations.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "stock_movements",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "stock-transfers",
    ],

    workflows: [
      "stock.transfer",
    ],

    validators: [],

    permissions: [
      "stock.transfer",
    ],

    featureFlags: [
      "inventory.in-transit",
    ],
  },

  {
    id: "inventory.stock-freeze",

    code: "STOCK_FREEZE",

    name: "Stock Freeze",

    description:
      "Temporarily prevent stock movement during audits.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [],

    schema: [
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "inventory-adjustments",
    ],

    workflows: [
      "stock.freeze",
    ],

    validators: [],

    permissions: [
      "stock.freeze",
    ],

    featureFlags: [
      "inventory.stock-freeze",
    ],
  },

  {
    id: "inventory.stock-adjustment",

    code: "STOCK_ADJUSTMENT",

    name: "Stock Adjustment",

    description:
      "Adjust inventory quantities manually.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
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
      "adjustment-reason-required",
    ],

    permissions: [
      "stock.adjust",
    ],

    featureFlags: [
      "inventory.stock-adjustment",
    ],
  },

  {
    id: "inventory.stock-aging",

    code: "STOCK_AGING",

    name: "Stock Aging",

    description:
      "Analyse inventory based on time spent in stock.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

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
      "reporting",
    ],

    ui: [
      "inventory-reports",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "inventory.stock-aging",
    ],
  },

  {
    id: "inventory.cycle-count",

    code: "CYCLE_COUNT",

    name: "Cycle Count",

    description:
      "Perform periodic inventory counts without full stock take.",

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
      "cycle-count",
    ],

    workflows: [
      "stock.count",
    ],

    validators: [],

    permissions: [
      "stock_movements.view",
    ],

    featureFlags: [
      "inventory.cycle-count",
    ],
  },

  {
    id: "inventory.abc-classification",

    code: "ABC_CLASSIFICATION",

    name: "ABC Classification",

    description:
      "Categorise inventory based on value and movement.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
      "inventory_balances",
    ],

    services: [
      "inventory",
      "reporting",
    ],

    ui: [
      "inventory-reports",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "inventory.abc-classification",
    ],
  },

];