/**
 * Canonical permission modules/resources for the GetAxe ERP.
 *
 * This describes the permission namespace, not implementation status.
 *
 * A resource may exist in the permission catalogue before its feature
 * is implemented. This is intentional: the permission model represents
 * the complete ERP authorization contract.
 */

export const PERMISSION_MODULES = {
  // ---------------------------------------------------------------------------
  // Platform / core
  // ---------------------------------------------------------------------------

  DASHBOARD: "dashboard",

  BUSINESS: "business",
  BRANCHES: "branches",
  WAREHOUSES: "warehouses",
  BUSINESS_SETTINGS: "business_settings",

  // ---------------------------------------------------------------------------
  // Identity & security
  // ---------------------------------------------------------------------------

  USERS: "users",
  ROLES: "roles",
  PERMISSIONS: "permissions",

  // ---------------------------------------------------------------------------
  // CRM / parties
  // ---------------------------------------------------------------------------

  CUSTOMERS: "customers",
  SUPPLIERS: "suppliers",

  // ---------------------------------------------------------------------------
  // Inventory
  // ---------------------------------------------------------------------------

  PRODUCTS: "products",
  CATEGORIES: "categories",
  UNITS: "units",

  PRICE_LISTS: "price_lists",
  PRODUCT_PRICES: "product_prices",
  PRODUCT_BATCHES: "product_batches",

  STOCK: "stock",
  STOCK_MOVEMENTS: "stock_movements",
  STOCK_ADJUSTMENTS: "stock_adjustments",
  STOCK_TRANSFERS: "stock_transfers",

  // ---------------------------------------------------------------------------
  // Purchasing
  // ---------------------------------------------------------------------------

  PURCHASE_ORDERS: "purchase_orders",
  GOODS_RECEIPTS: "goods_receipts",
  SUPPLIER_RETURNS: "supplier_returns",

  // ---------------------------------------------------------------------------
  // Sales
  // ---------------------------------------------------------------------------

  SALES: "sales",
  SALES_PAYMENTS: "sales.payments",
  SALES_RETURNS: "sales.returns",

  QUOTATIONS: "quotations",
  SALES_ORDERS: "sales.orders",

  DELIVERIES: "deliveries",

  DISCOUNTS: "discounts",
  PROMOTIONS: "promotions",
  LOYALTY: "loyalty",

  // ---------------------------------------------------------------------------
  // Finance
  // ---------------------------------------------------------------------------

  FINANCE: "finance",

  ACCOUNTS: "accounts",
  JOURNALS: "journals",

  PAYMENTS: "payments",
  RECEIPTS: "receipts",

  EXPENSES: "expenses",
  INCOME: "income",

  TAXES: "taxes",

  FISCAL_YEARS: "fiscal_years",
  FISCAL_PERIODS: "fiscal_periods",

  RECONCILIATIONS: "reconciliations",

  // ---------------------------------------------------------------------------
  // Reporting / analytics
  // ---------------------------------------------------------------------------

  REPORTS: "reports",
  REPORTING: "reporting",

  ANALYTICS: "analytics",
  FORECASTS: "forecasts",

  KPIS: "kpis",
  METRICS: "metrics",

  // ---------------------------------------------------------------------------
  // System / platform
  // ---------------------------------------------------------------------------

  AUDIT: "audit",
  NOTIFICATIONS: "notifications",
  INTEGRATIONS: "integrations",

  NUMBERING_SEQUENCES: "numbering_sequences",
} as const;

export type PermissionModule =
  (typeof PERMISSION_MODULES)[keyof typeof PERMISSION_MODULES];

export const PERMISSION_MODULE_VALUES = Object.values(
  PERMISSION_MODULES,
) as PermissionModule[];