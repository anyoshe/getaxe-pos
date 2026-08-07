export const CAPABILITY_MODULES = [
  "CORE",
  "INVENTORY",
  "SALES",
  "PURCHASING",
  "FINANCE",
  "CUSTOMERS",
  "SUPPLIERS",
  "PHARMACY",
  "CLINICAL",
  "INSURANCE",
  "REPORTING",
  "SETTINGS",
] as const;

export type CapabilityModule =
  (typeof CAPABILITY_MODULES)[number];