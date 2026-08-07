import type {
  CapabilityDefinition,
} from "../../../types";


export const DISCOUNT_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.discount-management",

    code: "DISCOUNT_MANAGEMENT",

    name: "Discount Management",

    description:
      "Apply and manage discounts during sales transactions.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "sales.pos",
    ],

    conflicts: [],

    schema: [
      "sale_items",
    ],

    services: [
      "sales",
    ],

    ui: [
      "pos",
      "sales-screen",
    ],

    workflows: [
      "sale.complete",
    ],

    validators: [
      "discount-validation",
    ],

    permissions: [
      "sales.discount.manage",
    ],

    featureFlags: [
      "sales.discount-management",
    ],
  },


  {
    id: "sales.discount-rules",

    code: "DISCOUNT_RULES",

    name: "Discount Rules",

    description:
      "Configure automatic discount rules based on conditions.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.discount-management",
    ],

    conflicts: [],

    schema: [
      "product_prices",
      "sale_items",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "discount-rules",
    ],

    workflows: [
      "sale.calculate-discount",
    ],

    validators: [
      "discount-rule-check",
    ],

    permissions: [
      "sales.discount.rules.manage",
    ],

    featureFlags: [
      "sales.discount-rules",
    ],
  },


  {
    id: "sales.promotions",

    code: "PROMOTIONS",

    name: "Sales Promotions",

    description:
      "Create time-based promotional offers.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.discount-management",
    ],

    conflicts: [],

    schema: [
      "product_prices",
      "sale_items",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "promotions",
    ],

    workflows: [
      "promotion.apply",
    ],

    validators: [],

    permissions: [
      "sales.promotions.manage",
    ],

    featureFlags: [
      "sales.promotions",
    ],
  },


  {
    id: "sales.coupons",

    code: "SALES_COUPONS",

    name: "Sales Coupons",

    description:
      "Allow customers to redeem discount coupons.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.discount-management",
    ],

    conflicts: [],

    schema: [
      "sale_items",
    ],

    services: [
      "sales",
    ],

    ui: [
      "coupons",
      "pos",
    ],

    workflows: [
      "coupon.validate",
    ],

    validators: [
      "coupon-validity-check",
    ],

    permissions: [
      "sales.coupons.manage",
    ],

    featureFlags: [
      "sales.coupons",
    ],
  },


  {
    id: "sales.discount-approval",

    code: "DISCOUNT_APPROVAL",

    name: "Discount Approval",

    description:
      "Require authorization for high-value discounts.",

    module: "SALES",

    group: "SALES",

    category: "SECURITY",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.discount-management",
    ],

    conflicts: [],

    schema: [
      "sale_items",
    ],

    services: [
      "sales",
    ],

    ui: [
      "discount-approval",
    ],

    workflows: [
      "discount.request",
      "discount.approve",
    ],

    validators: [
      "discount-limit-check",
    ],

    permissions: [
      "sales.discount.approve",
    ],

    featureFlags: [
      "sales.discount-approval",
    ],
  },


  {
    id: "sales.loyalty-program",

    code: "LOYALTY_PROGRAM",

    name: "Customer Loyalty Program",

    description:
      "Reward customers through points and loyalty benefits.",

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
    ],

    services: [
      "sales",
    ],

    ui: [
      "loyalty",
      "customers",
    ],

    workflows: [
      "loyalty.earn",
      "loyalty.redeem",
    ],

    validators: [],

    permissions: [
      "customers.loyalty.manage",
    ],

    featureFlags: [
      "sales.loyalty-program",
    ],
  },


];