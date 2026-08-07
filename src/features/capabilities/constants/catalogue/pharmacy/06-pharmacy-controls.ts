import type {
  CapabilityDefinition,
} from "../../../types";


export const PHARMACY_CONTROL_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "pharmacy.audit-trail",

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
      "pharmacy.dispensing",
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
      "pharmacy.activity-log",
    ],

    validators: [],

    permissions: [
      "pharmacy.audit.view",
    ],

    featureFlags: [
      "pharmacy.audit-trail",
    ],
  },


  {
    id: "pharmacy.medicine-recall",

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
      "pharmacy.medicine-catalogue",
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
      "pharmacy.recall.manage",
    ],

    featureFlags: [
      "pharmacy.medicine-recall",
    ],
  },


  {
    id: "pharmacy.cold-chain-monitoring",

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
      "pharmacy.medicine-catalogue",
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
      "pharmacy.cold-chain.manage",
    ],

    featureFlags: [
      "pharmacy.cold-chain",
    ],
  },


  {
    id: "pharmacy.reports",

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
      "pharmacy.dispensing",
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
      "pharmacy.reports.view",
    ],

    featureFlags: [
      "pharmacy.reports",
    ],
  },


];