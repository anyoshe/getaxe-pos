import type {
  CapabilityDefinition,
} from "../../../types";


export const EXPORT_ENGINE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.pdf-export",

    code: "PDF_EXPORT",

    name: "PDF Report Export",

    description:
      "Export reports into PDF format.",

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
      "report_exports",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "report-export",
    ],

    workflows: [
      "report.export.pdf",
    ],

    validators: [],

    permissions: [
      "reports.export.pdf",
    ],

    featureFlags: [
      "reporting.pdf-export",
    ],
  },


  {
    id: "reporting.excel-export",

    code: "EXCEL_EXPORT",

    name: "Excel Report Export",

    description:
      "Export reports into spreadsheet format.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.report-builder",
    ],

    conflicts: [],

    schema: [
      "reports",
      "report_exports",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "report-export",
    ],

    workflows: [
      "report.export.excel",
    ],

    validators: [],

    permissions: [
      "reports.export.excel",
    ],

    featureFlags: [
      "reporting.excel-export",
    ],
  },


  {
    id: "reporting.csv-export",

    code: "CSV_EXPORT",

    name: "CSV Export",

    description:
      "Export report data into CSV format for external processing.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.report-builder",
    ],

    conflicts: [],

    schema: [
      "reports",
      "report_exports",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "report-export",
    ],

    workflows: [
      "report.export.csv",
    ],

    validators: [],

    permissions: [
      "reports.export.csv",
    ],

    featureFlags: [
      "reporting.csv-export",
    ],
  },


  {
    id: "reporting.print-reports",

    code: "PRINT_REPORTS",

    name: "Print Ready Reports",

    description:
      "Generate reports optimized for printing.",

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
      "report-preview",
    ],

    workflows: [
      "report.print",
    ],

    validators: [],

    permissions: [
      "reports.print",
    ],

    featureFlags: [
      "reporting.print-reports",
    ],
  },


  {
    id: "reporting.external-data-export",

    code: "EXTERNAL_DATA_EXPORT",

    name: "External Data Export",

    description:
      "Export business data for external systems and analysis.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.report-builder",
    ],

    conflicts: [],

    schema: [
      "reports",
      "export_jobs",
    ],

    services: [
      "reporting",
      "integration",
    ],

    ui: [
      "data-export",
    ],

    workflows: [
      "data.export",
    ],

    validators: [
      "export-permission-check",
    ],

    permissions: [
      "reports.data-export.manage",
    ],

    featureFlags: [
      "reporting.external-data-export",
    ],
  },


];