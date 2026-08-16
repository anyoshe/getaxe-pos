import type {
  CapabilityDefinition,
} from "../../../types";

export const WAREHOUSING_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.multi-warehouse",

    code: "MULTI_WAREHOUSE",

    name: "Multiple Warehouses",

    description:
      "Manage inventory across multiple warehouses.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "warehouses",
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "warehouses",
      "products",
    ],

    workflows: [
      "stock.transfer",
      "purchase.receive",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "warehouses.update",
    ],

    featureFlags: [
      "inventory.multi-warehouse",
    ],
  },

  {
    id: "inventory.bin-locations",

    code: "BIN_LOCATIONS",

    name: "Bin Locations",

    description:
      "Track products by warehouse bin location.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.multi-warehouse",
    ],

    conflicts: [],

    schema: [
      "warehouses",
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "warehouses",
      "products",
    ],

    workflows: [
      "stock.transfer",
      "purchase.receive",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "warehouses.update",
    ],

    featureFlags: [
      "inventory.bin-locations",
    ],
  },

  {
    id: "inventory.shelf-locations",

    code: "SHELF_LOCATIONS",

    name: "Shelf Locations",

    description:
      "Track inventory by shelf position.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.bin-locations",
    ],

    conflicts: [],

    schema: [
      "warehouses",
      "inventory_balances",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "warehouses",
    ],

    workflows: [
      "stock.transfer",
    ],

    validators: [],

    permissions: [
      "warehouses.update",
    ],

    featureFlags: [
      "inventory.shelf-locations",
    ],
  },

  {
    id: "inventory.stock-transfers",

    code: "STOCK_TRANSFERS",

    name: "Stock Transfers",

    description:
      "Transfer inventory between warehouses.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.multi-warehouse",
    ],

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
      "inventory.stock-transfers",
    ],
  },

  {
    id: "inventory.picking",

    code: "PICKING",

    name: "Picking",

    description:
      "Generate picking lists for warehouse operations.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.multi-warehouse",
    ],

    conflicts: [],

    schema: [
      "stock_movements",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "picking",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "stock_movements.view",
    ],

    featureFlags: [
      "inventory.picking",
    ],
  },

  {
    id: "inventory.packing",

    code: "PACKING",

    name: "Packing",

    description:
      "Support packing before dispatch.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.picking",
    ],

    conflicts: [],

    schema: [
      "stock_movements",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "packing",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "stock_movements.view",
    ],

    featureFlags: [
      "inventory.packing",
    ],
  },

];