import type {
  CapabilityDefinition,
} from "../../../types";


export const PRESCRIPTION_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "products.update",

    code: "PRESCRIPTIONS",

    name: "Prescription Management",

    description:
      "Create and manage patient medicine prescriptions.",

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
      "products.update",
      "products.update",
    ],

    conflicts: [],

    schema: [
      "prescriptions",
      "prescription_items",
    ],

    services: [
      "pharmacy",
      "clinical",
    ],

    ui: [
      "prescriptions",
      "prescription-builder",
    ],

    workflows: [
      "prescription.create",
      "prescription.review",
    ],

    validators: [
      "medicine-required",
      "dosage-required",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

    code: "PRESCRIBER_MANAGEMENT",

    name: "Prescriber Management",

    description:
      "Manage doctors and healthcare providers who issue prescriptions.",

    module: "PHARMACY",

    group: "CLINICAL",

    category: "CLINICAL",

    status: "ACTIVE",

    industries: [
      "HOSPITAL",
      "CLINIC",
      "PHARMACY",
    ],

    defaultEnabled: false,

    dependencies: [
      "products.update",
    ],

    conflicts: [],

    schema: [
      "healthcare_providers",
    ],

    services: [
      "clinical",
      "pharmacy",
    ],

    ui: [
      "providers",
    ],

    workflows: [
      "provider.create",
      "prescription.authorize",
    ],

    validators: [
      "provider-required",
    ],

    permissions: [
      "users.view",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

    code: "PATIENT_PRESCRIPTION_HISTORY",

    name: "Prescription History",

    description:
      "Maintain patient prescription history.",

    module: "PHARMACY",

    group: "CLINICAL",

    category: "CLINICAL",

    status: "ACTIVE",

    industries: [
      "HOSPITAL",
      "CLINIC",
      "PHARMACY",
    ],

    defaultEnabled: false,

    dependencies: [
      "products.update",
    ],

    conflicts: [],

    schema: [
      "patients",
      "prescriptions",
    ],

    services: [
      "clinical",
      "pharmacy",
    ],

    ui: [
      "patient-history",
    ],

    workflows: [
      "patient.prescription-history",
    ],

    validators: [],

    permissions: [
      "customers.view",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

    code: "REFILL_CONTROL",

    name: "Prescription Refill Control",

    description:
      "Control medicine refills based on prescription rules.",

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
      "products.update",
    ],

    conflicts: [],

    schema: [
      "prescriptions",
      "dispensing_records",
    ],

    services: [
      "pharmacy",
      "sales",
    ],

    ui: [
      "prescription-refills",
    ],

    workflows: [
      "prescription.refill",
    ],

    validators: [
      "refill-limit-check",
    ],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


];