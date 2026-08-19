import type {
  CapabilityProfile,
} from "../types";

export const SUPERMARKET_PROFILE: CapabilityProfile = {
  id: "supermarket",
  name: "Supermarket",
  description: "Retail supermarket and convenience store.",
  businessType: "SUPERMARKET",
  enabled: [
    "inventory.product-types",
    "inventory.batch-control",
    "inventory.expiry-control",
    "inventory.reorder-level",
    "sales.pos",
    "sales.discount-management",
    "reporting.standard-reports",
    "reporting.dashboard-engine",
    "reporting.sales-analytics",
    "reporting.inventory-analytics",
  ],
  disabled: [
    "inventory.serial-numbers",
  ],
};
