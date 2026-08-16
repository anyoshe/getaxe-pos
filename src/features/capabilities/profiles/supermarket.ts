import type { CapabilityProfile } from "../types";

export const SUPERMARKET_PROFILE: CapabilityProfile = {
  id: "supermarket",

  name: "Supermarket",

  description: "Retail supermarket and convenience store.",

  businessType: "SUPERMARKET",

  enabled:[

 "inventory.batch-control",

 "inventory.expiry-control",

 "inventory.reorder-level",

 "sales.discount",

 "loyalty.manage",

 "reporting.report-builder",

 "reporting.standard-reports",

 "reporting.dashboard-engine",

 "reporting.sales-analytics",

 "reporting.inventory-analytics",

],

  disabled: ["inventory.serial-numbers", "products.update"],
};
