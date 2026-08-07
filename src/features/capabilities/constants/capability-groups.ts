export const CAPABILITY_GROUPS = [

  "CORE",

  "PRODUCTS",

  "INVENTORY",

  "PURCHASING",

  "SALES",

  "CUSTOMERS",

  "SUPPLIERS",

  "FINANCE",

  "PHARMACY",

  "CLINICAL",

  "INSURANCE",

  "REPORTS",

  "SETTINGS",

] as const;

export type CapabilityGroup =
    (typeof CAPABILITY_GROUPS)[number];