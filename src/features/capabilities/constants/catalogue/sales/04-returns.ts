import type {
  CapabilityDefinition,
} from "../../../types";


export const SALES_RETURN_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.customer-returns",

    code: "CUSTOMER_RETURNS",

    name: "Customer Returns",

    description:
      "Process products returned by customers.",

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
      "sale_returns",
      "sale_return_items",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "sales-returns",
    ],

    workflows: [
      "sale.return",
    ],

    validators: [
      "return-item-required",
    ],

    permissions: [
      "sales.returns.manage",
    ],

    featureFlags: [
      "sales.customer-returns",
    ],
  },


  {
    id: "sales.return-to-stock",

    code: "RETURN_TO_STOCK",

    name: "Return Stock Reintegration",

    description:
      "Return approved products back into available inventory.",

    module: "SALES",

    group: "SALES",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "sales.customer-returns",
    ],

    conflicts: [],

    schema: [
      "inventory_balances",
      "stock_movements",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "sales-returns",
    ],

    workflows: [
      "stock.return",
    ],

    validators: [
      "return-condition-check",
    ],

    permissions: [
      "inventory.stock.adjust",
    ],

    featureFlags: [
      "sales.return-to-stock",
    ],
  },


  {
    id: "sales.return-approval",

    code: "RETURN_APPROVAL",

    name: "Return Approval Workflow",

    description:
      "Require approval before processing customer returns.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-returns",
    ],

    conflicts: [],

    schema: [
      "sale_returns",
    ],

    services: [
      "sales",
    ],

    ui: [
      "sales-returns",
    ],

    workflows: [
      "return.submit",
      "return.approve",
    ],

    validators: [
      "return-approval-required",
    ],

    permissions: [
      "sales.returns.approve",
    ],

    featureFlags: [
      "sales.return-approval",
    ],
  },


  {
    id: "sales.exchange",

    code: "SALES_EXCHANGE",

    name: "Product Exchange",

    description:
      "Exchange returned products with replacement products.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-returns",
      "sales.return-to-stock",
    ],

    conflicts: [],

    schema: [
      "sale_returns",
      "sales",
      "inventory_balances",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "sales-exchange",
    ],

    workflows: [
      "sale.exchange",
    ],

    validators: [],

    permissions: [
      "sales.exchange.manage",
    ],

    featureFlags: [
      "sales.exchange",
    ],
  },


  {
    id: "sales.refund-processing",

    code: "REFUND_PROCESSING",

    name: "Customer Refund Processing",

    description:
      "Issue refunds for returned products.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.customer-returns",
      "sales.payment-refunds",
    ],

    conflicts: [],

    schema: [
      "payments",
      "payment_reversals",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "refunds",
    ],

    workflows: [
      "sale.refund",
    ],

    validators: [
      "refund-amount-check",
    ],

    permissions: [
      "sales.refunds.manage",
    ],

    featureFlags: [
      "sales.refund-processing",
    ],
  },


];