import type {
  CapabilityDefinition,
} from "../../../types";


export const CUSTOMER_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.customer-management",

    code: "CUSTOMER_MANAGEMENT",

    name: "Customer Management",

    description:
      "Manage customer profiles and sales relationships.",

    module: "SALES",

    group: "CUSTOMERS",

    category: "CUSTOMER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "customers",
    ],

    services: [
      "sales",
    ],

    ui: [
      "customers",
    ],

    workflows: [
      "customers.create",
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "customers.update",
    ],

    featureFlags: [
      "sales.customer-management",
    ],
  },


  {
    id: "sales.customer-groups",

    code: "CUSTOMER_GROUPS",

    name: "Customer Groups",

    description:
      "Group customers for pricing and reporting purposes.",

    module: "SALES",

    group: "CUSTOMERS",

    category: "CUSTOMER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-management",
    ],

    conflicts: [],

    schema: [
      "customers",
    ],

    services: [
      "sales",
    ],

    ui: [
      "customer-groups",
    ],

    workflows: [
      "customers.update",
    ],

    validators: [],

    permissions: [
      "customers.update",
    ],

    featureFlags: [
      "sales.customer-groups",
    ],
  },


  {
    id: "sales.customer-credit",

    code: "CUSTOMER_CREDIT",

    name: "Customer Credit Management",

    description:
      "Allow credit sales and customer balances.",

    module: "SALES",

    group: "CUSTOMERS",

    category: "CUSTOMER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-management",
    ],

    conflicts: [],

    schema: [
      "customers",
      "sales",
      "payments",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "customers",
      "customer-credit",
    ],

    workflows: [
      "sales.create",
      "sales.payments.receive",
    ],

    validators: [
      "credit-limit-check",
    ],

    permissions: [
      "customers.update",
    ],

    featureFlags: [
      "sales.customer-credit",
    ],
  },


  {
    id: "sales.customer-pricing",

    code: "CUSTOMER_PRICING",

    name: "Customer Specific Pricing",

    description:
      "Apply special pricing rules to selected customers.",

    module: "SALES",

    group: "CUSTOMERS",

    category: "CUSTOMER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.customer-specific-pricing",
      "sales.customer-management",
    ],

    conflicts: [],

    schema: [
      "customers",
      "product_prices",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "customers",
      "pricing",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "product_prices.update",
    ],

    featureFlags: [
      "sales.customer-pricing",
    ],
  },


  {
    id: "sales.customer-history",

    code: "CUSTOMER_HISTORY",

    name: "Customer Purchase History",

    description:
      "View customer transaction history.",

    module: "SALES",

    group: "CUSTOMERS",

    category: "CUSTOMER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "sales.customer-management",
    ],

    conflicts: [],

    schema: [
      "sales",
      "sale_items",
    ],

    services: [
      "sales",
      "reporting",
    ],

    ui: [
      "customers",
      "customer-history",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "customers.view",
    ],

    featureFlags: [
      "sales.customer-history",
    ],
  },


];