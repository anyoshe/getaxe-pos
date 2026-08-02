export const SYSTEM_ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    "*",
  ],

  ADMINISTRATOR: [
    "*",
  ],

  MANAGER: [
    "dashboard.*",
    "inventory.*",
    "warehouses.*",
    "stock_*.*",
    "suppliers.*",
    "purchase_orders.*",
    "goods_receipts.*",
    "supplier_returns.*",
    "sales.*",
    "customers.*",
    "reports.*",
  ],

  ACCOUNTANT: [
    "dashboard.view",
    "finance.*",
    "payments.*",
    "expenses.*",
    "income.*",
    "journal.*",
    "reports.*",
  ],

  PURCHASING_OFFICER: [
    "suppliers.*",
    "purchase_orders.*",
    "goods_receipts.*",
    "supplier_returns.*",
  ],

  STORE_KEEPER: [
    "inventory.*",
    "warehouses.*",
    "stock_*.*",
    "product_*.*",
  ],

  SALES_PERSON: [
    "customers.*",
    "sales.*",
    "quotes.*",
  ],

  CASHIER: [
    "dashboard.view",
    "sales.*",
    "customers.view",
    "customers.create",
  ],

  PHARMACIST: [],

  DOCTOR: [],

  NURSE: [],

  RECEPTIONIST: [],
} as const;