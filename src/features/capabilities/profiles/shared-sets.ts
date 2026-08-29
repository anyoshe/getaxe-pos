/** Baseline every signed-up business should get */
export const CORE_ERP = [
  "core.audit-log",
  "core.attachments",
  "inventory.product-types",
  "inventory.multi-unit",
  "inventory.reorder-level",
  "inventory.cost-price",
  "inventory.selling-price",
  "sales.pos",
  "sales.invoice-generation",
  "sales.receipts",
  "sales.customer-management",
  "sales.loyalty-program",
  "sales.multiple-payment-methods",
  "sales.customer-returns",
  "purchasing.supplier-management",
  "purchasing.purchase-orders",
  "purchasing.goods-receiving",
  "finance.chart-of-accounts",
  "finance.cash-accounts",
  "finance.tax-rates",
  "finance.expense-management",
  "finance.journal-entries",
  "reporting.standard-reports",
  "reporting.dashboard-engine",
  "reporting.sales-analytics",
  "reporting.inventory-analytics",
  "industry.services",
] as const;

export const PERISHABLE = [
  "inventory.batch-control",
  "inventory.expiry-control",
] as const;

export const SERIALIZED = ["inventory.serial-numbers"] as const;

export const MULTI_PRICE = [
  "inventory.multiple-price-lists",
  "sales.discount-management",
] as const;

export const QUOTATIONS = [
  "sales.quotation",
  "sales.orders",
] as const;

export const WHOLESALE_TRADE = [
  "inventory.multiple-price-lists",
  "sales.quotation",
  "sales.orders",
  "sales.customer-credit",
  "sales.discount-management",
] as const;

export const PHARMA_PACK = [
  "inventory.batch-control",
  "inventory.expiry-control",
  "inventory.reorder-level",
  "pharmacy.core",
  "pharmacy.medicine-catalogue",
  "pharmacy.drug-categories",
  "pharmacy.dispensing",
  "sales.customer-credit",
] as const;

function uniq(ids: readonly string[]): string[] {
  return Array.from(new Set(ids));
}

export function pack(...groups: readonly (readonly string[])[]): string[] {
  return uniq(groups.flatMap((g) => [...g]));
}
