import type {
  CapabilityDefinition,
} from "../../../types";

export const CORE_PLATFORM_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "core.audit-log",
    code: "AUDIT_LOG",
    name: "Audit Log",
    description:
      "Tracks every important operation performed in the system.",

    module: "CORE",
    group: "CORE",
    category: "SYSTEM",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "activity_logs",
    ],

    services: [
      "audit",
    ],

    ui: [],

    workflows: [],

    validators: [],

    permissions: [],

    featureFlags: [],
  },

  {
    id: "core.attachments",

    code: "ATTACHMENTS",

    name: "Document Attachments",

    description:
      "Allows files to be attached throughout the ERP.",

    module: "CORE",

    group: "CORE",

    category: "SYSTEM",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [],

    services: [
      "files",
    ],

    ui: [],

    workflows: [],

    validators: [],

    permissions: [],

    featureFlags: [],
  },

];