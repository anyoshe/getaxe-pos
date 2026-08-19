import type {
  CapabilityProfile,
} from "../types";

export const HARDWARE_PROFILE: CapabilityProfile = {
  id: "hardware",
  name: "Hardware Store",
  description: "Retail and wholesale hardware merchants.",
  businessType: "HARDWARE",
  enabled: [
    "inventory.product-types",
    "inventory.reorder-level",
    "inventory.serial-numbers",
    "sales.pos",
    "sales.quotation",
    "sales.discount-management",
    "purchasing.purchase-orders",
    "reporting.standard-reports",
    "reporting.dashboard-engine",
    "reporting.sales-analytics",
    "reporting.inventory-analytics",
  ],
  disabled: [
    "inventory.expiry-control",
    "inventory.batch-control",
  ],
};
