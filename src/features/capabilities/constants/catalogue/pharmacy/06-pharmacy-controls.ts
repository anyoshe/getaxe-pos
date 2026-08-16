import type {
  CapabilityDefinition,
} from "../../../types";


export const PHARMACY_CONTROL_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "products.update",

    code: "PHARMACY_AUDIT_TRAIL",

    name: "Pharmacy Audit Trail",

    description:
      "Track pharmacy activities including dispensing and medicine changes.",

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
      "audit_logs",
      "dispensing_records",
    ],

    services: [
      "pharmacy",
      "security",
    ],

    ui: [
      "pharmacy-audit",
    ],

    workflows: [
      "products.update",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


  {
    id: "products.update",

    code: "MEDICINE_RECALL",

    name: "Medicine Recall Management",

    description:
      "Manage recalled medicines and affected stock.",

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
      "inventory.batch-control",
      "inventory.expiry-control",
      "products.update",
    ],

    conflicts: [],

    schema: [
      "product_batches",
      "inventory_movements",
    ],

    services: [
      "pharmacy",
      "inventory",
    ],

    ui: [
      "medicine-recalls",
    ],

    workflows: [
      "medicine.recall",
    ],

    validators: [
      "batch-recall-check",
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

    code: "COLD_CHAIN_MONITORING",

    name: "Cold Chain Monitoring",

    description:
      "Monitor storage conditions for temperature-sensitive medicines.",

    module: "PHARMACY",

    group: "PHARMACY",

    category: "PHARMACY",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "HOSPITAL",
      "LABORATORY",
    ],

    defaultEnabled: false,

    dependencies: [
      "products.update",
    ],

    conflicts: [],

    schema: [
      "storage_locations",
      "temperature_logs",
    ],

    services: [
      "pharmacy",
      "inventory",
    ],

    ui: [
      "cold-chain-monitoring",
    ],

    workflows: [
      "temperature.record",
      "temperature.alert",
    ],

    validators: [
      "temperature-range-check",
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

    code: "PHARMACY_REPORTS",

    name: "Pharmacy Reports",

    description:
      "Generate pharmacy operational and compliance reports.",

    module: "PHARMACY",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "HOSPITAL",
      "CLINIC",
    ],

    defaultEnabled: false,

    dependencies: [
      "products.update",
      "finance.profit-loss",
    ],

    conflicts: [],

    schema: [
      "dispensing_records",
      "sales",
      "inventory_movements",
    ],

    services: [
      "pharmacy",
      "reporting",
      "finance",
    ],

    ui: [
      "pharmacy-reports",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "products.update",
    ],
  },


];