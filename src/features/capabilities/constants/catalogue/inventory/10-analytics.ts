import type {
  CapabilityDefinition,
} from "../../../types";

export const INVENTORY_ANALYTICS_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.valuation",

    code: "INVENTORY_VALUATION",

    name: "Inventory Valuation",

    description:
      "Calculate inventory value based on stock quantities and costs.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.cost-price",
    ],

    conflicts: [],

    schema: [
      "inventory_balances",
      "product_prices",
    ],

    services: [
      "inventory",
      "finance",
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
      "inventory.valuation",
    ],
  },


  {
    id: "inventory.moving-analysis",

    code: "MOVING_ANALYSIS",

    name: "Stock Movement Analysis",

    description:
      "Analyse fast and slow moving inventory.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

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
      "inventory.movement-analysis",
    ],
  },


  {
    id: "inventory.dead-stock",

    code: "DEAD_STOCK",

    name: "Dead Stock Analysis",

    description:
      "Identify products with no movement for a period.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

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
      "inventory.dead-stock",
    ],
  },


  {
    id: "inventory.turnover-analysis",

    code: "TURNOVER_ANALYSIS",

    name: "Inventory Turnover Analysis",

    description:
      "Measure how efficiently inventory is being sold.",

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
      "sale_items",
    ],

    services: [
      "inventory",
      "sales",
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
      "inventory.turnover-analysis",
    ],
  },


  {
    id: "inventory.demand-forecasting",

    code: "DEMAND_FORECASTING",

    name: "Demand Forecasting",

    description:
      "Predict future inventory requirements using historical data.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.moving-analysis",
    ],

    conflicts: [],

    schema: [
      "stock_movements",
      "sale_items",
    ],

    services: [
      "inventory",
      "reporting",
      "analytics",
    ],

    ui: [
      "inventory-dashboard",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "analytics.view",
    ],

    featureFlags: [
      "inventory.demand-forecasting",
    ],
  },


];