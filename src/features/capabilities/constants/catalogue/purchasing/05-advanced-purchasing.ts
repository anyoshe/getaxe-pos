import type {
  CapabilityDefinition,
} from "../../../types";


export const ADVANCED_PURCHASING_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "purchasing.reorder-management",

    code: "REORDER_MANAGEMENT",

    name: "Automatic Reordering",

    description:
      "Automatically suggest or create purchase requirements when stock reaches minimum levels.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.purchase-orders",
      "inventory.stock-levels",
    ],

    conflicts: [],

    schema: [
      "purchase_orders",
      "inventory_balances",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "reorder-settings",
      "purchase-orders",
    ],

    workflows: [
      "stock.low-level",
      "purchase.create",
    ],

    validators: [
      "minimum-stock-required",
    ],

    permissions: [
      "purchasing.reorder.manage",
    ],

    featureFlags: [
      "purchasing.reorder-management",
    ],
  },


  {
    id: "purchasing.supplier-comparison",

    code: "SUPPLIER_COMPARISON",

    name: "Supplier Comparison",

    description:
      "Compare suppliers based on price, availability and performance.",

    module: "PURCHASING",

    group: "SUPPLIERS",

    category: "SUPPLIER",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-management",
    ],

    conflicts: [],

    schema: [
      "suppliers",
      "purchase_orders",
    ],

    services: [
      "purchasing",
      "reporting",
    ],

    ui: [
      "supplier-comparison",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "suppliers.comparison.view",
    ],

    featureFlags: [
      "purchasing.supplier-comparison",
    ],
  },


  {
    id: "purchasing.approval-limits",

    code: "PURCHASE_APPROVAL_LIMITS",

    name: "Purchase Approval Limits",

    description:
      "Control purchase approvals based on transaction value.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.purchase-approval",
    ],

    conflicts: [],

    schema: [
      "purchase_orders",
      "users",
    ],

    services: [
      "purchasing",
      "users",
    ],

    ui: [
      "purchase-approval-settings",
    ],

    workflows: [
      "purchase.approve",
    ],

    validators: [
      "approval-limit-check",
    ],

    permissions: [
      "purchasing.approval.manage",
    ],

    featureFlags: [
      "purchasing.approval-limits",
    ],
  },


  {
    id: "purchasing.purchase-analytics",

    code: "PURCHASE_ANALYTICS",

    name: "Purchase Analytics",

    description:
      "Analyze purchasing trends and supplier spending.",

    module: "PURCHASING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.purchase-orders",
    ],

    conflicts: [],

    schema: [
      "purchase_orders",
      "goods_receipts",
    ],

    services: [
      "purchasing",
      "reporting",
    ],

    ui: [
      "purchase-reports",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.purchase.view",
    ],

    featureFlags: [
      "purchasing.purchase-analytics",
    ],
  },

  {
  id: "purchasing.purchase-costing",

  code: "PURCHASE_COSTING",

  name: "Purchase Costing",

  description:
    "Calculate actual inventory cost including landed purchase expenses.",

  module: "PURCHASING",

  group: "PURCHASING",

  category: "ACCOUNTING",

  status: "ACTIVE",

  industries: [],

  defaultEnabled: true,

  dependencies: [
    "purchasing.goods-receiving",
  ],

  conflicts: [],

  schema: [
    "products",
    "purchase_orders",
    "goods_receipts",
  ],

  services: [
    "purchasing",
    "inventory",
    "finance",
  ],

  ui: [
    "goods-receipt",
    "products",
  ],

  workflows: [
    "purchase.receive",
  ],

  validators: [],

  permissions: [
    "purchasing.costing.manage",
  ],

  featureFlags: [
    "purchasing.purchase-costing",
  ],
},

];