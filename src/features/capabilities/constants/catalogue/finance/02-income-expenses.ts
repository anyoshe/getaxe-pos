import type {
  CapabilityDefinition,
} from "../../../types";


export const INCOME_EXPENSE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "finance.income-management",

    code: "INCOME_MANAGEMENT",

    name: "Income Management",

    description:
      "Record and manage business income transactions.",

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
      "incomes",
      "income_categories",
    ],

    services: [
      "finance",
    ],

    ui: [
      "income-management",
    ],

    workflows: [
      "income.create",
      "income.post",
    ],

    validators: [
      "income-amount-required",
    ],

    permissions: [
      "finance.income.manage",
    ],

    featureFlags: [
      "finance.income-management",
    ],
  },


  {
    id: "finance.expense-management",

    code: "EXPENSE_MANAGEMENT",

    name: "Expense Management",

    description:
      "Record and manage business expenses.",

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
      "expenses",
      "expense_categories",
    ],

    services: [
      "finance",
    ],

    ui: [
      "expenses",
    ],

    workflows: [
      "expense.create",
      "expense.approve",
    ],

    validators: [
      "expense-amount-required",
    ],

    permissions: [
      "finance.expenses.manage",
    ],

    featureFlags: [
      "finance.expense-management",
    ],
  },


  {
    id: "finance.expense-approval",

    code: "EXPENSE_APPROVAL",

    name: "Expense Approval Workflow",

    description:
      "Require approval before posting expenses.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "finance.expense-management",
    ],

    conflicts: [],

    schema: [
      "expenses",
    ],

    services: [
      "finance",
    ],

    ui: [
      "expense-approval",
    ],

    workflows: [
      "expense.submit",
      "expense.approve",
    ],

    validators: [
      "expense-approval-required",
    ],

    permissions: [
      "finance.expenses.approve",
    ],

    featureFlags: [
      "finance.expense-approval",
    ],
  },


  {
    id: "finance.expense-categories",

    code: "EXPENSE_CATEGORIES",

    name: "Expense Categories",

    description:
      "Classify expenses for reporting and accounting.",

    module: "FINANCE",

    group: "FINANCE",

    category: "ACCOUNTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "finance.expense-management",
    ],

    conflicts: [],

    schema: [
      "expense_categories",
    ],

    services: [
      "finance",
    ],

    ui: [
      "expense-categories",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "finance.expenses.manage",
    ],

    featureFlags: [
      "finance.expense-categories",
    ],
  },


];