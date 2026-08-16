import type {
  CapabilityDefinition,
} from "../../../types";


export const DASHBOARD_ENGINE_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "reporting.dashboard-engine",

    code: "DASHBOARD_ENGINE",

    name: "Dashboard Engine",

    description:
      "Provide configurable dashboards with business metrics and visual insights.",

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
      "dashboards",
      "dashboard_widgets",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "dashboard-builder",
      "dashboard-view",
    ],

    workflows: [
      "dashboard.create",
      "dashboard.update",
    ],

    validators: [
      "dashboard-widget-required",
    ],

    permissions: [
      "dashboard.view",
    ],

    featureFlags: [
      "reporting.dashboard-engine",
    ],
  },


  {
    id: "reporting.kpi-management",

    code: "KPI_MANAGEMENT",

    name: "KPI Management",

    description:
      "Define and monitor key performance indicators.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.dashboard-engine",
    ],

    conflicts: [],

    schema: [
      "kpis",
      "kpi_values",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "kpi-management",
      "dashboard-view",
    ],

    workflows: [
      "kpi.create",
      "kpi.calculate",
    ],

    validators: [
      "kpi-definition-required",
    ],

    permissions: [
      "kpis.update",
    ],

    featureFlags: [
      "reporting.kpi-management",
    ],
  },


  {
    id: "reporting.role-dashboards",

    code: "ROLE_DASHBOARDS",

    name: "Role Based Dashboards",

    description:
      "Provide dashboards based on user roles and responsibilities.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.dashboard-engine",
    ],

    conflicts: [],

    schema: [
      "dashboards",
      "roles",
    ],

    services: [
      "reporting",
      "security",
    ],

    ui: [
      "dashboard-permissions",
    ],

    workflows: [
      "dashboard.assign",
    ],

    validators: [
      "dashboard-role-required",
    ],

    permissions: [
      "dashboard.view",
    ],

    featureFlags: [
      "reporting.role-dashboards",
    ],
  },


  {
    id: "reporting.visual-analytics",

    code: "VISUAL_ANALYTICS",

    name: "Visual Analytics",

    description:
      "Display charts, graphs and visual summaries from business data.",

    module: "REPORTING",

    group: "REPORTS",

    category: "REPORTING",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "reporting.dashboard-engine",
    ],

    conflicts: [],

    schema: [
      "dashboard_widgets",
    ],

    services: [
      "reporting",
    ],

    ui: [
      "charts",
      "analytics",
    ],

    workflows: [],

    validators: [],

    permissions: [
      "analytics.view",
    ],

    featureFlags: [
      "reporting.visual-analytics",
    ],
  },


];