import type {
  CapabilityDefinition,
} from "../../../types";

export const PRICING_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.cost-price",

    code: "COST_PRICE",

    name: "Cost Price",

    description:
      "Maintain product cost price.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "product_prices",
    ],

    services: [
      "inventory",
      "purchasing",
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
      "inventory.cost-price",
    ],
  },

  {
    id: "inventory.selling-price",

    code: "SELLING_PRICE",

    name: "Selling Price",

    description:
      "Maintain selling prices.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "product_prices",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.selling-price",
    ],
  },

  {
    id: "inventory.multiple-price-lists",

    code: "MULTIPLE_PRICE_LISTS",

    name: "Multiple Price Lists",

    description:
      "Support different prices for different customer groups.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.selling-price",
    ],

    conflicts: [],

    schema: [
      "price_lists",
      "product_prices",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "price-lists",
      "products",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "price_lists.update",
    ],

    featureFlags: [
      "inventory.price-lists",
    ],
  },

  {
    id: "inventory.customer-specific-pricing",

    code: "CUSTOMER_SPECIFIC_PRICING",

    name: "Customer Specific Pricing",

    description:
      "Allow negotiated prices per customer.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.multiple-price-lists",
    ],

    conflicts: [],

    schema: [
      "product_prices",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "customers",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "customers.update",
    ],

    featureFlags: [
      "inventory.customer-pricing",
    ],
  },

  {
    id: "inventory.promotional-pricing",

    code: "PROMOTIONAL_PRICING",

    name: "Promotional Pricing",

    description:
      "Support temporary promotional prices.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.selling-price",
    ],

    conflicts: [],

    schema: [
      "product_prices",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "price_lists.update",
    ],

    featureFlags: [
      "inventory.promotional-pricing",
    ],
  },

  {
    id: "inventory.margin-control",

    code: "MARGIN_CONTROL",

    name: "Margin Control",

    description:
      "Calculate and enforce minimum product margins.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRICING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.cost-price",
      "inventory.selling-price",
    ],

    conflicts: [],

    schema: [
      "product_prices",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [
      "minimum-margin",
    ],

    permissions: [
      "price_lists.update",
    ],

    featureFlags: [
      "inventory.margin-control",
    ],
  },

];