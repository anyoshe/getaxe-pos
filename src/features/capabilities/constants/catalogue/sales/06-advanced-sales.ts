import type {
  CapabilityDefinition,
} from "../../../types";


export const ADVANCED_SALES_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.orders",

    code: "SALES_ORDERS",

    name: "Sales Orders",

    description:
      "Create and manage customer orders before completion.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.pos",
    ],

    conflicts: [],

    schema: [
      "sales",
      "sale_items",
    ],

    services: [
      "sales",
    ],

    ui: [
      "sales-orders",
    ],

    workflows: [
      "sales.orders.create",
      "sales.orders.approve",
      "sales.orders.complete",
    ],

    validators: [
      "customer-required",
      "product-required",
    ],

    permissions: [
      "sales.orders.update",
    ],

    featureFlags: [
      "sales.orders",
    ],
  },


  {
    id: "sales.delivery-management",

    code: "DELIVERY_MANAGEMENT",

    name: "Delivery Management",

    description:
      "Manage product deliveries after sales orders.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [
      "WHOLESALE",
      "RETAIL",
      "PHARMACY",
      "HARDWARE",
    ],

    defaultEnabled: false,

    dependencies: [
      "sales.orders",
    ],

    conflicts: [],

    schema: [
      "sales",
      "customers",
    ],

    services: [
      "sales",
    ],

    ui: [
      "deliveries",
    ],

    workflows: [
      "deliveries.create",
      "deliveries.complete",
    ],

    validators: [
      "delivery-address-required",
    ],

    permissions: [
      "deliveries.update",
    ],

    featureFlags: [
      "sales.delivery-management",
    ],
  },


  {
    id: "sales.quotation-conversion",

    code: "QUOTATION_CONVERSION",

    name: "Quotation Conversion",

    description:
      "Convert approved quotations into sales orders.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.quotation",
    ],

    conflicts: [],

    schema: [
      "sales",
    ],

    services: [
      "sales",
    ],

    ui: [
      "quotations",
    ],

    workflows: [
      "quotations.convert",
    ],

    validators: [],

    permissions: [
      "quotations.update",
    ],

    featureFlags: [
      "sales.quotation-conversion",
    ],
  },


  {
    id: "sales.recurring-sales",

    code: "RECURRING_SALES",

    name: "Recurring Sales",

    description:
      "Automate repeated customer sales transactions.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [
      "SERVICES",
      "SUBSCRIPTION",
    ],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-management",
    ],

    conflicts: [],

    schema: [
      "sales",
      "customers",
    ],

    services: [
      "sales",
    ],

    ui: [
      "subscriptions",
    ],

    workflows: [
      "sales.create",
    ],

    validators: [],

    permissions: [
      "sales.create",
    ],

    featureFlags: [
      "sales.recurring-sales",
    ],
  },


  {
    id: "sales.multi-branch",

    code: "MULTI_BRANCH_SALES",

    name: "Multi Branch Sales",

    description:
      "Allow sales transactions across multiple business branches.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "sales",
      "branches",
    ],

    services: [
      "sales",
      "settings",
    ],

    ui: [
      "branch-selector",
    ],

    workflows: [
      "sales.complete",
    ],

    validators: [],

    permissions: [
      "branches.view",
    ],

    featureFlags: [
      "sales.multi-branch",
    ],
  },


  {
    id: "sales.offline-pos",

    code: "OFFLINE_POS",

    name: "Offline POS Mode",

    description:
      "Continue sales operations during temporary connectivity loss.",

    module: "SALES",

    group: "SALES",

    category: "SYSTEM",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.pos",
    ],

    conflicts: [],

    schema: [
      "sales",
    ],

    services: [
      "sales",
      "sync",
    ],

    ui: [
      "pos",
    ],

    workflows: [
      "sales.update",
    ],

    validators: [
      "offline-transaction-validation",
    ],

    permissions: [
      "sales.update",
    ],

    featureFlags: [
      "sales.offline-pos",
    ],
  },


];