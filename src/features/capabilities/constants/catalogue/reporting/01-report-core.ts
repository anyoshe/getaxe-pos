import type {
  CapabilityDefinition,
} from "../../../types";


export const REPORT_CORE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.report-builder",

    code: "REPORT_BUILDER",

    name: "Report Builder",

    description:
      "Create configurable business reports from system data.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "reports",
      "report_definitions",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "report-builder",
    ],

    workflows: [
      "report.create",
      "report.update",
    ],

    validators: [
      "report-definition-required",
    ],

    permissions: [
      "reports.builder.manage",
    ],

    featureFlags: [
      "reporting.report-builder",
    ],
  },


  {
    id: "reporting.standard-reports",

    code: "STANDARD_REPORTS",

    name: "Standard Reports",

    description:
      "Provide predefined operational and management reports.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "reporting.report-builder",
    ],

    conflicts: [],

    schema: [
      "reports",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "reports-library",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "reports.standard.view",
    ],

    featureFlags: [
      "reporting.standard-reports",
    ],
  },


];