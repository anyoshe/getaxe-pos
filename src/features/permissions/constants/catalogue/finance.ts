import type { PermissionModule } from "../../types";

export const FINANCE_PERMISSION_MODULES: readonly PermissionModule[] = [
  {
    code: "FINANCE",
    name: "Finance",
    description: "Financial management and accounting",
    permissions: [
      {
        code: "finance.dashboard",
        action: "VIEW",
        name: "View Finance Dashboard",
        description: "Allows viewing the finance dashboard",
      },
      {
        code: "accounts.create",
        action: "CREATE",
        name: "Create Accounts",
        description: "Allows creating financial accounts",
      },
      {
        code: "accounts.update",
        action: "UPDATE",
        name: "Update Accounts",
        description: "Allows updating financial accounts",
      },
      {
        code: "sales.payments.receive",
        action: "CREATE",
        name: "Receive Payments",
        description: "Allows receiving payments",
      },
      {
        code: "payments.post",
        action: "POST",
        name: "Complete Payments",
        description: "Allows completing payments",
      },
      {
        code: "payments.create",
        action: "CREATE",
        name: "Record Deposits",
        description: "Allows recording deposits",
      },
      {
        code: "payments.reconcile",
        action: "UPDATE",
        name: "Reconcile Payments",
        description: "Allows reconciling payments",
      },
      {
        code: "sales.returns.refund",
        action: "CANCEL",
        name: "Refund Payments",
        description: "Allows processing payment refunds",
      },
      {
        code: "expenses.create",
        action: "CREATE",
        name: "Create Expenses",
        description: "Allows creating expenses",
      },
      {
        code: "expenses.create",
        action: "CREATE",
        name: "Submit Expenses",
        description: "Allows submitting expenses",
      },
      {
        code: "expenses.approve",
        action: "APPROVE",
        name: "Approve Expenses",
        description: "Allows approving expenses",
      },
      {
        code: "income.create",
        action: "CREATE",
        name: "Create Income",
        description: "Allows creating income records",
      },
      {
        code: "income.post",
        action: "POST",
        name: "Post Income",
        description: "Allows posting income records",
      },
      {
        code: "journals.create",
        action: "CREATE",
        name: "Create Journal Entries",
        description: "Allows creating journal entries",
      },
      {
        code: "journals.post",
        action: "POST",
        name: "Post Journal Entries",
        description: "Allows posting journal entries",
      },
      {
        code: "taxes.view",
        action: "CREATE",
        name: "Calculate Tax",
        description: "Allows calculating tax",
      },
      {
        code: "taxes.create",
        action: "CREATE",
        name: "Create Tax Records",
        description: "Allows creating tax records",
      },
      {
        code: "taxes.update",
        action: "UPDATE",
        name: "Update Tax Records",
        description: "Allows updating tax records",
      },
      {
        code: "fiscal_periods.close",
        action: "CLOSE",
        name: "Close Financial Period",
        description: "Allows closing a financial period",
      },
      {
        code: "cash.transfer",
        action: "CREATE",
        name: "Transfer Cash",
        description: "Allows transferring cash",
      },
    ],
  },
];

export default FINANCE_PERMISSION_MODULES;
