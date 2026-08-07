import type {
  CapabilityDefinition,
} from "../../../types";


export const SALES_CORE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.pos",

    code: "POINT_OF_SALE",

    name: "Point of Sale",

    description:
      "Process customer sales transactions.",

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
      "sale_items",
    ],

    services: [
      "sales",
      "inventory",
    ],

    ui: [
      "pos",
      "sales-screen",
    ],

    workflows: [
      "sale.create",
      "sale.complete",
    ],

    validators: [
      "product-required",
      "quantity-required",
    ],

    permissions: [
      "sales.create",
    ],

    featureFlags: [
      "sales.pos",
    ],
  },


  {
    id: "sales.invoice-generation",

    code: "INVOICE_GENERATION",

    name: "Invoice Generation",

    description:
      "Generate invoices from completed sales.",

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
      "sales",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "invoices",
    ],

    workflows: [
      "sale.complete",
    ],

    validators: [],

    permissions: [
      "sales.invoice.manage",
    ],

    featureFlags: [
      "sales.invoice-generation",
    ],
  },


  {
    id: "sales.receipts",

    code: "SALES_RECEIPTS",

    name: "Sales Receipts",

    description:
      "Generate customer receipts after payment.",

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
      "sales",
      "payments",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "receipt-printing",
    ],

    workflows: [
      "payment.complete",
    ],

    validators: [],

    permissions: [
      "sales.receipts.manage",
    ],

    featureFlags: [
      "sales.receipts",
    ],
  },


  {
    id: "sales.quotation",

    code: "QUOTATIONS",

    name: "Sales Quotations",

    description:
      "Create quotations before converting to sales.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [],

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
      "quotation.create",
      "quotation.convert",
    ],

    validators: [],

    permissions: [
      "sales.quotation.manage",
    ],

    featureFlags: [
      "sales.quotation",
    ],
  },


];