import type {
  CapabilityDefinition,
} from "../../../types";

export const DISPENSING_CAPABILITIES: CapabilityDefinition[] = [
  {
    id: "pharmacy.dispensing",
    code: "DISPENSING",
    name: "Medicine Dispensing",
    description: "Dispense medicines against prescriptions and sales transactions.",
    module: "PHARMACY",
    group: "PHARMACY",
    category: "PHARMACY",
    status: "ACTIVE",
    industries: [
      "PHARMACY",
      "HOSPITAL",
      "CLINIC",
    ],
    defaultEnabled: false,
    dependencies: [
      "pharmacy.prescriptions",
      "inventory.batch-control",
      "inventory.expiry-control",
    ],
    conflicts: [],
    schema: [
      "dispensing_records",
      "prescription_items",
      "inventory_movements",
    ],
    services: [
      "pharmacy",
      "inventory",
      "sales",
    ],
    ui: [
      "dispensing-screen",
      "pharmacy-sales",
    ],
    workflows: [
      "medicine.dispense",
      "stock.allocate",
    ],
    validators: [
      "prescription-required",
      "stock-available",
      "expiry-check",
    ],
    permissions: [
      "products.update",
    ],
    featureFlags: [
      "pharmacy.dispensing",
    ],
  },
  {
    id: "pharmacy.partial-dispensing",
    code: "PARTIAL_DISPENSING",
    name: "Partial Dispensing",
    description: "Allow dispensing part of a prescribed quantity.",
    module: "PHARMACY",
    group: "PHARMACY",
    category: "PHARMACY",
    status: "ACTIVE",
    industries: [
      "PHARMACY",
      "HOSPITAL",
      "CLINIC",
    ],
    defaultEnabled: false,
    dependencies: [
      "pharmacy.dispensing",
    ],
    conflicts: [],
    schema: [
      "dispensing_records",
      "prescription_items",
    ],
    services: [
      "pharmacy",
      "inventory",
    ],
    ui: [
      "partial-dispensing",
    ],
    workflows: [
      "medicine.partial-dispense",
    ],
    validators: [
      "remaining-quantity-check",
    ],
    permissions: [
      "products.update",
    ],
    featureFlags: [
      "pharmacy.partial-dispensing",
    ],
  },
  {
    id: "pharmacy.pharmacist-verification",
    code: "PHARMACIST_VERIFICATION",
    name: "Pharmacist Verification",
    description: "Require pharmacist approval before medicine dispensing.",
    module: "PHARMACY",
    group: "PHARMACY",
    category: "PHARMACY",
    status: "ACTIVE",
    industries: [
      "PHARMACY",
      "HOSPITAL",
    ],
    defaultEnabled: false,
    dependencies: [
      "pharmacy.dispensing",
    ],
    conflicts: [],
    schema: [
      "dispensing_records",
      "users",
    ],
    services: [
      "pharmacy",
      "security",
    ],
    ui: [
      "dispensing-verification",
    ],
    workflows: [
      "dispensing.verify",
    ],
    validators: [
      "authorized-pharmacist-required",
    ],
    permissions: [
      "products.update",
    ],
    featureFlags: [
      "pharmacy.pharmacist-verification",
    ],
  },
  {
    id: "pharmacy.medicine-substitution",
    code: "MEDICINE_SUBSTITUTION",
    name: "Medicine Substitution",
    description: "Allow approved alternative medicine substitutions.",
    module: "PHARMACY",
    group: "PHARMACY",
    category: "PHARMACY",
    status: "ACTIVE",
    industries: [
      "PHARMACY",
      "HOSPITAL",
    ],
    defaultEnabled: false,
    dependencies: [
      "pharmacy.dispensing",
      "pharmacy.medicine-catalogue",
    ],
    conflicts: [],
    schema: [
      "products",
      "dispensing_records",
    ],
    services: [
      "pharmacy",
    ],
    ui: [
      "medicine-substitution",
    ],
    workflows: [
      "medicine.substitute",
    ],
    validators: [
      "substitution-approved",
    ],
    permissions: [
      "products.update",
    ],
    featureFlags: [
      "pharmacy.medicine-substitution",
    ],
  },
];
