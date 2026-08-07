import type {
  CapabilityDefinition,
} from "../../../types";


export const PURCHASE_ORDER_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "purchasing.purchase-orders",

    code: "PURCHASE_ORDERS",

    name: "Purchase Orders",

    description:
      "Create and manage supplier purchase orders.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "purchase_orders",
      "purchase_order_items",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "purchase-orders",
    ],

    workflows: [
      "purchase.create",
      "purchase.approve",
    ],

    validators: [
      "supplier-required",
      "product-required",
    ],

    permissions: [
      "purchasing.orders.manage",
    ],

    featureFlags: [
      "purchasing.purchase-orders",
    ],
  },


  {
    id: "purchasing.purchase-approval",

    code: "PURCHASE_APPROVAL",

    name: "Purchase Approval Workflow",

    description:
      "Require approval before submitting purchase orders.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.purchase-orders",
    ],

    conflicts: [],

    schema: [
      "purchase_orders",
    ],

    services: [
      "purchasing",
    ],

    ui: [
      "purchase-orders",
    ],

    workflows: [
      "purchase.submit",
      "purchase.approve",
    ],

    validators: [
      "purchase-approval-required",
    ],

    permissions: [
      "purchasing.orders.approve",
    ],

    featureFlags: [
      "purchasing.purchase-approval",
    ],
  },


];