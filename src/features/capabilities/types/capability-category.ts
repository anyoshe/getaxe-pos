export const CAPABILITY_CATEGORIES = [
  "PRODUCT",
  "STOCK",
  "PRICING",
  "SALES",
  "PURCHASE",
  "CUSTOMER",
  "SUPPLIER",
  "ACCOUNTING",
  "PHARMACY",
  "CLINICAL",
  "INSURANCE",
  "REPORTING",
  "SECURITY",
  "SYSTEM",
] as const;

export type CapabilityCategory =
  (typeof CAPABILITY_CATEGORIES)[number];