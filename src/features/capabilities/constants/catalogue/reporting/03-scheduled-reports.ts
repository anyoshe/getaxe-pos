import type {
  CapabilityDefinition,
} from "../../../types";


export const SCHEDULED_REPORT_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.scheduled-reports",

    code: "SCHEDULED_REPORTS",

    name: "Scheduled Reports",

    description:
      "Automatically generate reports according to configured schedules.",

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
      "report_schedules",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "report-scheduler",
    ],

    workflows: [
      "report.schedule",
      "report.generate",
    ],

    validators: [
      "schedule-required",
    ],

    permissions: [
      "reports.schedule.manage",
    ],

    featureFlags: [
      "reporting.scheduled-reports",
    ],
  },


  {
    id: "reporting.email-report-delivery",

    code: "EMAIL_REPORT_DELIVERY",

    name: "Email Report Delivery",

    description:
      "Deliver generated reports through email.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.scheduled-reports",
    ],

    conflicts: [],

    schema: [
      "report_deliveries",
      "email_logs",
    ],

    services: [
      "reporting",
      "notifications",
    ],

    ui: [
      "report-delivery-settings",
    ],

    workflows: [
      "report.email.send",
    ],

    validators: [
      "recipient-required",
    ],

    permissions: [
      "reports.delivery.manage",
    ],

    featureFlags: [
      "reporting.email-delivery",
    ],
  },


  {
    id: "reporting.recurring-management-reports",

    code: "RECURRING_MANAGEMENT_REPORTS",

    name: "Recurring Management Reports",

    description:
      "Generate recurring business performance reports.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.scheduled-reports",
      "reporting.standard-reports",
    ],

    conflicts: [],

    schema: [
      "report_schedules",
      "reports",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "management-reports",
    ],

    workflows: [
      "management-report.generate",
    ],

    validators: [],

    permissions: [
      "reports.management.view",
    ],

    featureFlags: [
      "reporting.recurring-management-reports",
    ],
  },


];