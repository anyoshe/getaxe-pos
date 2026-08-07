import type {
  CapabilityDefinition,
} from "../../../types";


export const ACCOUNTING_CORE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "finance.chart-of-accounts",

    code: "CHART_OF_ACCOUNTS",

    name: "Chart of Accounts",

    description:
      "Manage accounting accounts structure.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "chart_of_accounts",
      "account_categories",
      "account_types",
    ],

    services: [
      "finance",
    ],

    ui: [
      "chart-of-accounts",
    ],

    workflows: [
      "account.create",
      "account.update",
    ],

    validators: [
      "account-code-required",
    ],

    permissions: [
      "finance.accounts.manage",
    ],

    featureFlags: [
      "finance.chart-of-accounts",
    ],
  },


  {
    id: "finance.journal-entries",

    code: "JOURNAL_ENTRIES",

    name: "Journal Entries",

    description:
      "Record accounting transactions using double entry journals.",

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
      "journal_entries",
      "journal_entry_lines",
    ],

    services: [
      "finance",
    ],

    ui: [
      "journal-entry",
    ],

    workflows: [
      "journal.create",
      "journal.post",
    ],

    validators: [
      "debit-credit-balance",
    ],

    permissions: [
      "finance.journal.manage",
    ],

    featureFlags: [
      "finance.journal-entries",
    ],
  },


  {
    id: "finance.accounting-periods",

    code: "ACCOUNTING_PERIODS",

    name: "Accounting Periods",

    description:
      "Manage fiscal periods and financial closing.",

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
      "fiscal_years",
    ],

    services: [
      "finance",
    ],

    ui: [
      "fiscal-years",
    ],

    workflows: [
      "period.close",
    ],

    validators: [
      "period-open-check",
    ],

    permissions: [
      "finance.periods.manage",
    ],

    featureFlags: [
      "finance.accounting-periods",
    ],
  },


];