import type {
  CapabilityDefinition,
} from "../../../types";


export const AUDIT_COMPLIANCE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.audit-reports",

    code: "AUDIT_REPORTS",

    name: "Audit Reports",

    description:
      "Generate audit reports for business activities and transactions.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "security.audit-logs",
    ],

    conflicts: [],

    schema: [
      "audit_logs",
      "transactions",
    ],

    services: [
      "reporting",
      "security",
    ],

    ui: [
      "audit-reports",
    ],

    workflows: [
      "audit.report.generate",
    ],

    validators: [],

    permissions: [
      "audit.view",
    ],

    featureFlags: [
      "reporting.audit-reports",
    ],
  },


  {
    id: "reporting.user-activity-reports",

    code: "USER_ACTIVITY_REPORTS",

    name: "User Activity Reports",

    description:
      "Track user actions and system activities.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "security.audit-logs",
    ],

    conflicts: [],

    schema: [
      "audit_logs",
      "users",
    ],

    services: [
      "reporting",
      "security",
    ],

    ui: [
      "user-activity-report",
    ],

    workflows: [
      "user.activity.report",
    ],

    validators: [],

    permissions: [
      "audit.view",
    ],

    featureFlags: [
      "reporting.user-activity",
    ],
  },


  {
    id: "reporting.compliance-monitoring",

    code: "COMPLIANCE_MONITORING",

    name: "Compliance Monitoring",

    description:
      "Monitor compliance requirements and business controls.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CLINICAL",
      "INSURANCE",
    ],

    defaultEnabled: false,

    dependencies: [
      "reporting.audit-reports",
    ],

    conflicts: [],

    schema: [
      "compliance_records",
      "audit_logs",
    ],

    services: [
      "reporting",
      "security",
    ],

    ui: [
      "compliance-dashboard",
    ],

    workflows: [
      "compliance.check",
    ],

    validators: [
      "compliance-rule-check",
    ],

    permissions: [
      "audit.view",
    ],

    featureFlags: [
      "reporting.compliance-monitoring",
    ],
  },


  {
    id: "reporting.security-reports",

    code: "SECURITY_REPORTS",

    name: "Security Reports",

    description:
      "Generate reports on security events and access activities.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "security.audit-logs",
    ],

    conflicts: [],

    schema: [
      "audit_logs",
      "permissions",
    ],

    services: [
      "reporting",
      "security",
    ],

    ui: [
      "security-reports",
    ],

    workflows: [
      "security.report.generate",
    ],

    validators: [],

    permissions: [
      "audit.view",
    ],

    featureFlags: [
      "reporting.security-reports",
    ],
  },


  {
    id: "reporting.regulatory-reports",

    code: "REGULATORY_REPORTS",

    name: "Regulatory Reports",

    description:
      "Generate reports required for regulatory and compliance purposes.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CLINICAL",
      "INSURANCE",
    ],

    defaultEnabled: false,

    dependencies: [
      "reporting.compliance-monitoring",
    ],

    conflicts: [],

    schema: [
      "compliance_records",
      "transactions",
    ],

    services: [
      "reporting",
      "compliance",
    ],

    ui: [
      "regulatory-reports",
    ],

    workflows: [
      "regulatory.report.generate",
    ],

    validators: [
      "regulatory-validation",
    ],

    permissions: [
      "audit.view",
    ],

    featureFlags: [
      "reporting.regulatory-reports",
    ],
  },


];