import type {
  CapabilityProfile,
} from "../types";

export const HARDWARE_PROFILE: CapabilityProfile = {

  id: "hardware",

  name: "Hardware Store",

  description:
    "Retail and wholesale hardware merchants.",

  businessType: "HARDWARE",

  enabled:[

 "inventory.serial-numbers",

 "inventory.reorder-level",

 "sales.quotation",

 "sales.discount",

 "purchasing.purchase-orders",

 "supplier.management",

 "reporting.report-builder",

 "reporting.standard-reports",

 "reporting.dashboard-engine",

 "reporting.sales-analytics",

 "reporting.inventory-analytics",

],

 disabled:[

 "inventory.expiry-control",

 "inventory.batch-control",

 "products.update",

],

};