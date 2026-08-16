import type {
  CapabilityDefinition,
} from "../../../types";


export const FINANCIAL_REPORTING_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "finance.profit-loss",

    code: "PROFIT_LOSS",

    name: "Profit and Loss Statement",

    description:
      "Generate profit and loss financial reports.",

    module: "FINANCE",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "finance.chart-of-accounts",
      "finance.journal-entries",
    ],

    conflicts: [],

    schema: [
      "journal_entries",
      "journal_entry_lines",
    ],

    services: [
      "finance",
      "reporting",
    ],

    ui: [
      "profit-loss-report",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "finance.profit-loss",
    ],
  },


  {
    id: "finance.balance-sheet",

    code: "BALANCE_SHEET",

    name: "Balance Sheet",

    description:
      "Generate assets, liabilities and equity reports.",

    module: "FINANCE",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "finance.chart-of-accounts",
      "finance.journal-entries",
    ],

    conflicts: [],

    schema: [
      "journal_entries",
      "journal_entry_lines",
    ],

    services: [
      "finance",
      "reporting",
    ],

    ui: [
      "balance-sheet-report",
    ],

    workflows: [],

    validators: [
      "balance-sheet-check",
    ],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "finance.balance-sheet",
    ],
  },


  {
    id: "finance.cash-flow",

    code: "CASH_FLOW",

    name: "Cash Flow Statement",

    description:
      "Track movement of cash within the business.",

    module: "FINANCE",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.cash-accounts",
      "finance.journal-entries",
    ],

    conflicts: [],

    schema: [
      "cash_accounts",
      "journal_entries",
    ],

    services: [
      "finance",
      "reporting",
    ],

    ui: [
      "cash-flow-report",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "finance.cash-flow",
    ],
  },


  {
    id: "finance.trial-balance",

    code: "TRIAL_BALANCE",

    name: "Trial Balance",

    description:
      "Verify accounting debit and credit balances.",

    module: "FINANCE",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.journal-entries",
    ],

    conflicts: [],

    schema: [
      "journal_entries",
      "journal_entry_lines",
    ],

    services: [
      "finance",
      "reporting",
    ],

    ui: [
      "trial-balance-report",
    ],

    workflows: [],

    validators: [
      "debit-credit-balance",
    ],

    permissions: [
      "reports.view",
    ],

    featureFlags: [
      "finance.trial-balance",
    ],
  },


  {
    id: "finance.dashboard",

    code: "FINANCIAL_DASHBOARD",

    name: "Financial Dashboard",

    description:
      "Provide financial performance dashboards and metrics.",

    module: "FINANCE",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.profit-loss",
      "finance.balance-sheet",
    ],

    conflicts: [],

    schema: [
      "journal_entries",
      "sales",
      "expenses",
    ],

    services: [
      "finance",
      "reporting",
    ],

    ui: [
      "financial-dashboard",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "finance.view",
    ],

    featureFlags: [
      "finance.dashboard",
    ],
  },


];