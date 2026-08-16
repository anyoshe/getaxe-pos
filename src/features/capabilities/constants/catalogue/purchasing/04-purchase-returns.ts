import type {
  CapabilityDefinition,
} from "../../../types";


export const PURCHASE_RETURN_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "purchasing.supplier-returns",

    code: "SUPPLIER_RETURNS",

    name: "Supplier Returns",

    description:
      "Return purchased products back to suppliers.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.goods-receiving",
    ],

    conflicts: [],

    schema: [
      "supplier_returns",
      "supplier_return_items",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "supplier-returns",
    ],

    workflows: [
      "purchase.return",
    ],

    validators: [
      "return-item-required",
    ],

    permissions: [
      "supplier_returns.create",
    ],

    featureFlags: [
      "purchasing.supplier-returns",
    ],
  },


  {
    id: "purchasing.return-stock-adjustment",

    code: "RETURN_STOCK_ADJUSTMENT",

    name: "Return Stock Adjustment",

    description:
      "Remove returned supplier goods from inventory stock.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "STOCK",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-returns",
    ],

    conflicts: [],

    schema: [
      "inventory_balances",
      "stock_movements",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "supplier-returns",
    ],

    workflows: [
      "stock.decrease",
    ],

    validators: [
      "available-stock-check",
    ],

    permissions: [
      "stock.adjust",
    ],

    featureFlags: [
      "purchasing.return-stock-adjustment",
    ],
  },


  {
    id: "purchasing.return-approval",

    code: "PURCHASE_RETURN_APPROVAL",

    name: "Purchase Return Approval",

    description:
      "Require authorization before returning goods to suppliers.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-returns",
    ],

    conflicts: [],

    schema: [
      "supplier_returns",
    ],

    services: [
      "purchasing",
    ],

    ui: [
      "supplier-returns",
    ],

    workflows: [
      "return.submit",
      "return.approve",
    ],

    validators: [
      "return-approval-required",
    ],

    permissions: [
      "supplier_returns.approve",
    ],

    featureFlags: [
      "purchasing.return-approval",
    ],
  },


  {
    id: "purchasing.supplier-credit-note",

    code: "SUPPLIER_CREDIT_NOTE",

    name: "Supplier Credit Notes",

    description:
      "Track supplier credits resulting from returned goods.",

    module: "PURCHASING",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "purchasing.supplier-returns",
    ],

    conflicts: [],

    schema: [
      "supplier_returns",
      "journal_entries",
    ],

    services: [
      "purchasing",
      "finance",
    ],

    ui: [
      "supplier-credit-notes",
    ],

    workflows: [
      "supplier.credit",
    ],

    validators: [],

    permissions: [
      "finance.approve",
    ],

    featureFlags: [
      "purchasing.supplier-credit-note",
    ],
  },


];