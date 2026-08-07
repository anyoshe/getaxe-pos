import type {
  CapabilityProfile,
} from "../types";

export const PHARMACY_PROFILE: CapabilityProfile = {

  id: "pharmacy",

  name: "Retail Pharmacy",

  description:
    "Retail pharmacy with dispensing and prescription support.",

  businessType: "PHARMACY",

  enabled: [

  "inventory.batch-control",

  "inventory.expiry-control",

  "inventory.reorder-level",

  "pharmacy.prescriptions",

  "pharmacy.dispensing",

  "pharmacy.partial-dispensing",

  "pharmacy.pharmacist-verification",

  "pharmacy.medicine-substitution",

  "sales.credit-sales",

  "reporting.report-builder",

  "reporting.standard-reports",

  "reporting.dashboard-engine",

  "reporting.inventory-analytics",

  "reporting.sales-analytics",

],

  disabled: [

  "inventory.serial-numbers",

],
};