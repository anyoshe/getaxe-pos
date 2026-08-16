import type { PermissionModule } from "../../types";

export const REPORTING_PERMISSION_MODULES: readonly PermissionModule[] = [
  {
    code: "REPORTING",
    name: "Reporting",
    description: "Reports, analytics, forecasting, and business intelligence",
    permissions: [
      {
        code: "reports.print",
        action: "PRINT",
        name: "Print Reports",
        description: "Allows printing reports",
      },
      {
        code: "reports.create",
        action: "CREATE",
        name: "Create Reports",
        description: "Allows creating reports",
      },
      {
        code: "reports.execute",
        action: "CREATE",
        name: "Generate Reports",
        description: "Allows generating reports",
      },
      {
        code: "reports.print",
        action: "PRINT",
        name: "Print Report",
        description: "Allows printing an individual report",
      },
      {
        code: "reports.create",
        action: "CREATE",
        name: "Schedule Reports",
        description: "Allows scheduling reports",
      },
      {
        code: "reports.update",
        action: "UPDATE",
        name: "Update Reports",
        description: "Allows updating reports",
      },
      {
        code: "reporting.forecasting",
        action: "VIEW",
        name: "View Forecasting",
        description: "Allows access to forecasting functionality",
      },
      {
        code: "forecast.generate",
        action: "CREATE",
        name: "Generate Forecasts",
        description: "Allows generating forecasts",
      },
      {
        code: "kpi.calculate",
        action: "CREATE",
        name: "Calculate KPIs",
        description: "Allows calculating key performance indicators",
      },
      {
        code: "kpi.create",
        action: "CREATE",
        name: "Create KPIs",
        description: "Allows creating KPI definitions",
      },
      {
        code: "metric.calculate",
        action: "CREATE",
        name: "Calculate Metrics",
        description: "Allows calculating business metrics",
      },
      {
        code: "data.export",
        action: "EXPORT",
        name: "Export Data",
        description: "Allows exporting business data",
      },
    ],
  },
];

export default REPORTING_PERMISSION_MODULES;
