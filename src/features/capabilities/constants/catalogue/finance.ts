import {
  ACCOUNTING_CORE_CAPABILITIES,
} from "./finance/01-accounting-core";

import {
  INCOME_EXPENSE_CAPABILITIES,
} from "./finance/02-income-expenses";

import {
  CASH_MANAGEMENT_CAPABILITIES,
} from "./finance/03-cash-management";

import {
  TAX_CAPABILITIES,
} from "./finance/04-tax";

import {
  FINANCIAL_REPORTING_CAPABILITIES,
} from "./finance/05-financial-reporting";


export const FINANCE_CAPABILITIES = [
  ...ACCOUNTING_CORE_CAPABILITIES,
  ...INCOME_EXPENSE_CAPABILITIES,
  ...CASH_MANAGEMENT_CAPABILITIES,
  ...TAX_CAPABILITIES,
  ...FINANCIAL_REPORTING_CAPABILITIES,
];