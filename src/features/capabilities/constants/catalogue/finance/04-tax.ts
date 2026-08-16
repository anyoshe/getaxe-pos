import type {
  CapabilityDefinition,
} from "../../../types";


export const TAX_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "finance.tax-rates",

    code: "TAX_RATES",

    name: "Tax Rates",

    description:
      "Configure and manage business tax rates.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "finance.chart-of-accounts",
    ],

    conflicts: [],

    schema: [
      "tax_rates",
    ],

    services: [
      "finance",
    ],

    ui: [
      "tax-settings",
    ],

    workflows: [
      "taxes.create",
      "taxes.update",
    ],

    validators: [
      "tax-rate-required",
    ],

    permissions: [
      "taxes.update",
    ],

    featureFlags: [
      "finance.tax-rates",
    ],
  },


  {
    id: "finance.vat-management",

    code: "VAT_MANAGEMENT",

    name: "VAT Management",

    description:
      "Manage value added tax calculations on transactions.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [
      "RETAIL",
      "WHOLESALE",
      "SERVICES",
    ],

    defaultEnabled: false,

    dependencies: [
      "finance.tax-rates",
    ],

    conflicts: [],

    schema: [
      "tax_rates",
      "sales",
      "purchase_orders",
    ],

    services: [
      "finance",
      "sales",
      "purchasing",
    ],

    ui: [
      "tax-settings",
      "sales",
      "purchases",
    ],

    workflows: [
      "taxes.view",
    ],

    validators: [
      "vat-calculation-check",
    ],

    permissions: [
      "taxes.update",
    ],

    featureFlags: [
      "finance.vat-management",
    ],
  },


  {
    id: "finance.withholding-tax",

    code: "WITHHOLDING_TAX",

    name: "Withholding Tax",

    description:
      "Apply withholding tax rules during payments.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.tax-rates",
    ],

    conflicts: [],

    schema: [
      "tax_rates",
      "payments",
    ],

    services: [
      "finance",
    ],

    ui: [
      "tax-settings",
      "payments",
    ],

    workflows: [
      "taxes.view",
    ],

    validators: [
      "withholding-tax-check",
    ],

    permissions: [
      "taxes.update",
    ],

    featureFlags: [
      "finance.withholding-tax",
    ],
  },


  {
    id: "finance.tax-inclusive-pricing",

    code: "TAX_INCLUSIVE_PRICING",

    name: "Tax Inclusive Pricing",

    description:
      "Support prices that include tax values.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.tax-rates",
    ],

    conflicts: [],

    schema: [
      "product_prices",
      "tax_rates",
    ],

    services: [
      "finance",
      "inventory",
      "sales",
    ],

    ui: [
      "pricing",
      "tax-settings",
    ],

    workflows: [
      "price.calculate-tax",
    ],

    validators: [
      "tax-price-validation",
    ],

    permissions: [
      "taxes.update",
    ],

    featureFlags: [
      "finance.tax-inclusive-pricing",
    ],
  },


];