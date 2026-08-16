import type {
  CapabilityDefinition,
} from "../../../types";


export const BUSINESS_INTELLIGENCE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.business-metrics",

    code: "BUSINESS_METRICS",

    name: "Business Metrics",

    description:
      "Track and analyse important business performance measurements.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.dashboard-engine",
    ],

    conflicts: [],

    schema: [
      "business_metrics",
      "metric_values",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "metrics-dashboard",
    ],

    workflows: [
      "metric.calculate",
    ],

    validators: [
      "metric-definition-required",
    ],

    permissions: [
      "metrics.update",
    ],

    featureFlags: [
      "reporting.business-metrics",
    ],
  },


  {
    id: "reporting.sales-analytics",

    code: "SALES_ANALYTICS",

    name: "Sales Analytics",

    description:
      "Analyse sales performance, trends and revenue patterns.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.business-metrics",
      "sales",
    ],

    conflicts: [],

    schema: [
      "sales",
      "sale_items",
    ],

    services: [
      "reporting",
      "sales",
    ],

    ui: [
      "sales-analytics",
    ],

    workflows: [
      "sales.analytics.generate",
    ],

    validators: [],

    permissions: [
      "analytics.view",
    ],

    featureFlags: [
      "reporting.sales-analytics",
    ],
  },


  {
    id: "reporting.inventory-analytics",

    code: "INVENTORY_ANALYTICS",

    name: "Inventory Analytics",

    description:
      "Analyse stock movement, availability and inventory performance.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.business-metrics",
      "inventory.batch-control",
    ],

    conflicts: [],

    schema: [
      "inventory_movements",
      "inventory_balances",
    ],

    services: [
      "reporting",
      "inventory",
    ],

    ui: [
      "inventory-analytics",
    ],

    workflows: [
      "inventory.analytics.generate",
    ],

    validators: [],

    permissions: [
      "analytics.view",
    ],

    featureFlags: [
      "reporting.inventory-analytics",
    ],
  },


  {
    id: "reporting.financial-analytics",

    code: "FINANCIAL_ANALYTICS",

    name: "Financial Analytics",

    description:
      "Analyse financial performance and profitability.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.accounting-core",
      "reporting.business-metrics",
    ],

    conflicts: [],

    schema: [
      "transactions",
      "financial_entries",
    ],

    services: [
      "reporting",
      "finance",
    ],

    ui: [
      "financial-analytics",
    ],

    workflows: [
      "finance.analytics.generate",
    ],

    validators: [],

    permissions: [
      "analytics.view",
    ],

    featureFlags: [
      "reporting.financial-analytics",
    ],
  },


  {
    id: "reporting.forecasting",

    code: "FORECASTING",

    name: "Business Forecasting",

    description:
      "Predict future business trends using historical data.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.business-metrics",
    ],

    conflicts: [],

    schema: [
      "forecast_models",
      "metric_values",
    ],

    services: [
      "reporting",
      "analytics",
    ],

    ui: [
      "forecast-dashboard",
    ],

    workflows: [
      "forecast.generate",
    ],

    validators: [],

    permissions: [
      "forecasts.execute",
    ],

    featureFlags: [
      "reporting.forecasting",
    ],
  },


];