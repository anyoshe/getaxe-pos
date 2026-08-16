import type {
  CapabilityDefinition,
} from "../../../types";


export const PAYMENT_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "sales.payment-processing",

    code: "PAYMENT_PROCESSING",

    name: "Payment Processing",

    description:
      "Process customer payments during sales transactions.",

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
      "payments",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "payment-screen",
    ],

    workflows: [
      "payments.post",
    ],

    validators: [
      "payment-amount-required",
    ],

    permissions: [
      "sales.payments.receive",
    ],

    featureFlags: [
      "sales.payment-processing",
    ],
  },


  {
    id: "sales.multiple-payment-methods",

    code: "MULTIPLE_PAYMENT_METHODS",

    name: "Multiple Payment Methods",

    description:
      "Support cash, card, mobile money and other payment methods.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "sales.payment-processing",
    ],

    conflicts: [],

    schema: [
      "payments",
      "payment_methods",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "payment-screen",
      "settings.payment-methods",
    ],

    workflows: [
      "payments.post",
    ],

    validators: [],

    permissions: [
      "sales.payments.receive",
    ],

    featureFlags: [
      "sales.multiple-payment-methods",
    ],
  },


  {
    id: "sales.split-payments",

    code: "SPLIT_PAYMENTS",

    name: "Split Payments",

    description:
      "Allow a single sale to be paid using multiple methods.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.multiple-payment-methods",
    ],

    conflicts: [],

    schema: [
      "payments",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "payment-screen",
    ],

    workflows: [
      "payments.post",
    ],

    validators: [
      "payment-total-match",
    ],

    permissions: [
      "sales.payments.receive",
    ],

    featureFlags: [
      "sales.split-payments",
    ],
  },


  {
    id: "sales.customer-deposits",

    code: "CUSTOMER_DEPOSITS",

    name: "Customer Deposits",

    description:
      "Receive advance payments before completing sales.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.payment-processing",
    ],

    conflicts: [],

    schema: [
      "payments",
      "customers",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "customer-account",
    ],

    workflows: [
      "payments.create",
    ],

    validators: [],

    permissions: [
      "payments.create",
    ],

    featureFlags: [
      "sales.customer-deposits",
    ],
  },


  {
    id: "sales.payment-refunds",

    code: "PAYMENT_REFUNDS",

    name: "Payment Refunds",

    description:
      "Refund customer payments.",

    module: "SALES",

    group: "SALES",

    category: "SALES",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.payment-processing",
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
      "sales.returns.refund",
    ],

    validators: [
      "refund-approval-required",
    ],

    permissions: [
      "sales.returns.refund",
    ],

    featureFlags: [
      "sales.payment-refunds",
    ],
  },


  {
    id: "sales.payment-reconciliation",

    code: "PAYMENT_RECONCILIATION",

    name: "Payment Reconciliation",

    description:
      "Match payments against sales and accounting records.",

    module: "SALES",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "sales.payment-processing",
    ],

    conflicts: [],

    schema: [
      "payments",
      "journal_entries",
    ],

    services: [
      "sales",
      "finance",
    ],

    ui: [
      "payment-reconciliation",
    ],

    workflows: [
      "payments.reconcile",
    ],

    validators: [],

    permissions: [
      "reconciliations.reconcile",
    ],

    featureFlags: [
      "sales.payment-reconciliation",
    ],
  },


];