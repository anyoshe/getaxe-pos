import type {
  CapabilityProfile,
} from "../types";

export const PHARMACY_PROFILE: CapabilityProfile = {
  id: "pharmacy",
  name: "Retail Pharmacy",
  description: "Retail pharmacy with dispensing and prescription support.",
  businessType: "PHARMACY",
  enabled: [
    "inventory.product-types",
    "inventory.batch-control",
    "inventory.expiry-control",
    "inventory.reorder-level",
    "sales.pos",
    "sales.customer-credit",
    "pharmacy.core",
    "pharmacy.medicine-catalogue",
    "reporting.standard-reports",
    "reporting.dashboard-engine",
    "reporting.inventory-analytics",
    "reporting.sales-analytics",
  ],
  disabled: [
    "inventory.serial-numbers",
  ],
};
