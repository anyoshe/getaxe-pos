import type {
  CapabilityDefinition,
} from "../../../types";


export const CASH_MANAGEMENT_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "finance.cash-accounts",

    code: "CASH_ACCOUNTS",

    name: "Cash Accounts",

    description:
      "Manage business cash and bank accounts.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "finance.chart-of-accounts",
    ],

    conflicts: [],

    schema: [
      "cash_accounts",
    ],

    services: [
      "finance",
    ],

    ui: [
      "cash-accounts",
    ],

    workflows: [
      "cash-account.create",
      "cash-account.update",
    ],

    validators: [
      "account-name-required",
    ],

    permissions: [
      "payments.view",
    ],

    featureFlags: [
      "finance.cash-accounts",
    ],
  },


  {
    id: "finance.cash-transfers",

    code: "CASH_TRANSFERS",

    name: "Cash Transfers",

    description:
      "Transfer funds between cash and bank accounts.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.cash-accounts",
    ],

    conflicts: [],

    schema: [
      "cash_accounts",
      "journal_entries",
    ],

    services: [
      "finance",
    ],

    ui: [
      "cash-transfer",
    ],

    workflows: [
      "cash.transfer",
    ],

    validators: [
      "source-account-required",
      "destination-account-required",
    ],

    permissions: [
      "payments.create",
    ],

    featureFlags: [
      "finance.cash-transfers",
    ],
  },


  {
    id: "finance.opening-balances",

    code: "OPENING_BALANCES",

    name: "Opening Balances",

    description:
      "Set initial accounting balances when starting a business.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.chart-of-accounts",
    ],

    conflicts: [],

    schema: [
      "journal_entries",
      "journal_entry_lines",
    ],

    services: [
      "finance",
    ],

    ui: [
      "opening-balances",
    ],

    workflows: [
      "accounts.update",
    ],

    validators: [
      "opening-balance-balanced",
    ],

    permissions: [
      "accounts.update",
    ],

    featureFlags: [
      "finance.opening-balances",
    ],
  },


  {
    id: "finance.payment-reconciliation",

    code: "PAYMENT_RECONCILIATION",

    name: "Payment Reconciliation",

    description:
      "Reconcile payments with financial records.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.cash-accounts",
      "finance.journal-entries",
    ],

    conflicts: [],

    schema: [
      "payments",
      "cash_accounts",
      "journal_entries",
    ],

    services: [
      "finance",
      "sales",
    ],

    ui: [
      "payment-reconciliation",
    ],

    workflows: [
      "payments.reconcile",
    ],

    validators: [
      "reconciliation-match-check",
    ],

    permissions: [
      "reconciliations.reconcile",
    ],

    featureFlags: [
      "finance.payment-reconciliation",
    ],
  },


];