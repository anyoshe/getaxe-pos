import { pgEnum } from "drizzle-orm/pg-core";

/* =====================================================
   Business
===================================================== */

export const businessTypeEnum = pgEnum("business_type", [
  "RETAIL",
  "WHOLESALE",
  "PHARMACY",
  "CHEMIST",
  "CLINIC",
  "HOSPITAL",
]);

/* =====================================================
   Users
===================================================== */

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "PHARMACIST",
  "CASHIER",
  "STORE_KEEPER",
]);

/* =====================================================
   Stock
===================================================== */

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "OPENING_STOCK",
  "PURCHASE",
  "SALE",
  "SALE_RETURN",
  "PURCHASE_RETURN",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "DAMAGED",
  "EXPIRED",
]);

/* =====================================================
   Purchase Orders
===================================================== */

export const purchaseOrderStatusEnum = pgEnum(
  "purchase_order_status",
  [
    "DRAFT",
    "PENDING",
    "APPROVED",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "CANCELLED",
  ]
);

/* =====================================================
   Goods Receipt
===================================================== */

export const goodsReceiptStatusEnum = pgEnum(
  "goods_receipt_status",
  [
    "DRAFT",
    "POSTED",
    "CANCELLED",
  ]
);

/* =====================================================
   Sales
===================================================== */

export const saleStatusEnum = pgEnum("sale_status", [
  "DRAFT",
  "COMPLETED",
  "VOIDED",
  "REFUNDED",
]);

/* =====================================================
   Payments
===================================================== */

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "MPESA",
  "CARD",
  "BANK_TRANSFER",
  "CHEQUE",
  "CREDIT",
  "MOBILE_MONEY",
  "GIFT_VOUCHER",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "PARTIAL",
  "COMPLETED",
  "FAILED",
  "REVERSED",
  "REFUNDED",
]);
/* =====================================================
   Prescriptions
===================================================== */


export const prescriptionStatusEnum = pgEnum(
  "prescription_status",
  [
    "PENDING",
    "PARTIALLY_DISPENSED",
    "DISPENSED",
    "CANCELLED",
    "EXPIRED",
  ]
);

/* =====================================================
   Expenses
===================================================== */

export const expenseStatusEnum = pgEnum("expense_status", [
  "PENDING",
  "APPROVED",
  "PAID",
  "CANCELLED",
]);
/* =====================================================
   Purchase Return Reason
===================================================== */

export const returnReasonEnum = pgEnum("return_reason", [
  "DAMAGED",
  "EXPIRED",
  "WRONG_ITEM",
  "RECALL",
  "OVER_SUPPLIED",
  "OTHER",
]);

/* =====================================================
   Sales Return Reason
===================================================== */

export const saleReturnReasonEnum = pgEnum("sale_return_reason", [
  "DAMAGED",
  "DEFECTIVE",
  "EXPIRED",
  "WRONG_ITEM",
  "CUSTOMER_CHANGED_MIND",
  "PRICE_ADJUSTMENT",
  "OTHER",
]);

/* =====================================================
  Activity action
===================================================== */

export const activityActionEnum = pgEnum("activity_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "APPROVE",
  "REJECT",
  "VOID",
  "RETURN",
  "PAY",
  "PRINT",
  "EXPORT",
]);

/* =====================================================
 Entity Type
===================================================== */

export const entityTypeEnum = pgEnum("entity_type", [
  "BUSINESS",
  "USER",
  "ROLE",
  "PRODUCT",
  "CATEGORY",
  "SUPPLIER",
  "PURCHASE_ORDER",
  "GOODS_RECEIPT",
  "SALE",
  "PAYMENT",
  "CUSTOMER",
  "PRESCRIPTION",
  "EXPENSE",
  "SETTING",
]);

/* =====================================================
 Cash account
===================================================== */
export const cashAccountTypeEnum = pgEnum("cash_account_type", [
  "CASH",
  "BANK",
  "MPESA",
  "MOBILE_MONEY",
  "PETTY_CASH",
]);

/* =====================================================
 Normal Balance
===================================================== */
export const normalBalanceEnum = pgEnum("normal_balance", [
  "DEBIT",
  "CREDIT",
]);

/* =====================================================
 Income Transactions
===================================================== */
export const transactionStatusEnum = pgEnum("transaction_status", [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "COMPLETED",
  "VOIDED",
  "CANCELLED",
]);

/* =====================================================
Journal Source
===================================================== */
export const journalSourceTypeEnum = pgEnum("journal_source_type", [
  "SALE",
  "PURCHASE",
  "EXPENSE",
  "INCOME",
  "PAYMENT",
  "RECEIPT",
  "PURCHASE_RETURN",
  "SALES_RETURN",
  "STOCK_ADJUSTMENT",
  "STOCK_TRANSFER",
  "OPENING_BALANCE",
  "MANUAL_JOURNAL",
]);

/* =====================================================
Journal StatusSXxsAZ
===================================================== */
export const journalStatusEnum = pgEnum("journal_status", [
  "DRAFT",
  "POSTED",
  "REVERSED",
  "VOIDED",
]);

/* =====================================================
Document type
===================================================== */
export const documentTypeEnum = pgEnum("document_type", [
  "SALE",
  "PURCHASE_ORDER",
  "GOODS_RECEIPT",
  "SUPPLIER_RETURN",
  "SALE_RETURN",
  "PAYMENT",
  "EXPENSE",
  "INCOME",
  "JOURNAL",
  "STOCK_TRANSFER",
  "STOCK_ADJUSTMENT",
]);

/* =====================================================
Dispensing level
===================================================== */
export const dispensingLevelEnum = pgEnum("dispensing_level", [
  "OTC",
  "PRESCRIPTION",
  "CONTROLLED",
  "NARCOTIC",
]);

export const customerTypeEnum = pgEnum("customer_type", [
  "INDIVIDUAL",
  "BUSINESS",
]);

export const genderEnum = pgEnum("gender", [
  "MALE",
  "FEMALE",
  "OTHER",
]);

export const bloodGroupEnum = pgEnum("blood_group", [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const dispensationStatusEnum = pgEnum(
  "dispensation_status",
  [
    "PENDING",
    "PARTIALLY_DISPENSED",
    "DISPENSED",
    "CANCELLED",
  ]
);

export const consultationStatusEnum = pgEnum(
  "consultation_status",
  [
    "OPEN",
    "COMPLETED",
    "REFERRED",
    "CANCELLED",
  ]
);

export const diagnosisTypeEnum = pgEnum(
  "diagnosis_type",
  [
    "PRIMARY",
    "SECONDARY",
    "PROVISIONAL",
    "DIFFERENTIAL",
  ]
);

export const insuranceClaimStatusEnum = pgEnum(
  "insurance_claim_status",
  [
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "APPROVED",
    "PARTIALLY_APPROVED",
    "REJECTED",
    "PAID",
    "CANCELLED",
  ]
);