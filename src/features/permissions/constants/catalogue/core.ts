import type { PermissionModule } from "../../types";

export const CORE_PERMISSION_MODULES: PermissionModule[] = [
  {
    code: "DASHBOARD",
    name: "Dashboard",
    description: "Dashboard and analytics",
    permissions: [
      {
        code: "dashboard.view",
        action: "VIEW",
        name: "View Dashboard",
        description: "Allows viewing the dashboard",
      },
    ],
  },

  {
    code: "BUSINESS",
    name: "Business",
    description: "Business management",
    permissions: [
      {
        code: "business.view",
        action: "VIEW",
        name: "View Business",
        description: "Allows viewing business details",
      },
      {
        code: "business.update",
        action: "UPDATE",
        name: "Update Business",
        description: "Allows updating business details",
      },
      {
        code: "business.export",
        action: "EXPORT",
        name: "Export Business",
        description: "Allows exporting business information",
      },
    ],
  },

  {
    code: "BRANCHES",
    name: "Branches",
    description: "Business branch management",
    permissions: [
      {
        code: "branches.view",
        action: "VIEW",
        name: "View Branches",
        description: "Allows viewing branches",
      },
      {
        code: "branches.create",
        action: "CREATE",
        name: "Create Branches",
        description: "Allows creating branches",
      },
      {
        code: "branches.update",
        action: "UPDATE",
        name: "Update Branches",
        description: "Allows updating branches",
      },
      {
        code: "branches.delete",
        action: "DELETE",
        name: "Delete Branches",
        description: "Allows deleting branches",
      },
      {
        code: "branches.activate",
        action: "ACTIVATE",
        name: "Activate Branches",
        description: "Allows activating branches",
      },
      {
        code: "branches.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Branches",
        description: "Allows deactivating branches",
      },
      {
        code: "branches.export",
        action: "EXPORT",
        name: "Export Branches",
        description: "Allows exporting branches",
      },
    ],
  },

  {
    code: "WAREHOUSES",
    name: "Warehouses",
    description: "Warehouse management",
    permissions: [
      {
        code: "warehouses.view",
        action: "VIEW",
        name: "View Warehouses",
        description: "Allows viewing warehouses",
      },
      {
        code: "warehouses.create",
        action: "CREATE",
        name: "Create Warehouses",
        description: "Allows creating warehouses",
      },
      {
        code: "warehouses.update",
        action: "UPDATE",
        name: "Update Warehouses",
        description: "Allows updating warehouses",
      },
      {
        code: "warehouses.delete",
        action: "DELETE",
        name: "Delete Warehouses",
        description: "Allows deleting warehouses",
      },
      {
        code: "warehouses.activate",
        action: "ACTIVATE",
        name: "Activate Warehouses",
        description: "Allows activating warehouses",
      },
      {
        code: "warehouses.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Warehouses",
        description: "Allows deactivating warehouses",
      },
      {
        code: "warehouses.export",
        action: "EXPORT",
        name: "Export Warehouses",
        description: "Allows exporting warehouses",
      },
    ],
  },

  {
    code: "FISCAL_YEARS",
    name: "Fiscal Years",
    description: "Fiscal year management",
    permissions: [
      {
        code: "fiscal_years.view",
        action: "VIEW",
        name: "View Fiscal Years",
        description: "Allows viewing fiscal years",
      },
      {
        code: "fiscal_years.create",
        action: "CREATE",
        name: "Create Fiscal Years",
        description: "Allows creating fiscal years",
      },
      {
        code: "fiscal_years.update",
        action: "UPDATE",
        name: "Update Fiscal Years",
        description: "Allows updating fiscal years",
      },
      {
        code: "fiscal_years.close",
        action: "CLOSE",
        name: "Close Fiscal Year",
        description: "Allows closing a fiscal year",
      },
      {
        code: "fiscal_years.reopen",
        action: "REOPEN",
        name: "Reopen Fiscal Year",
        description: "Allows reopening a fiscal year",
      },
      {
        code: "fiscal_years.export",
        action: "EXPORT",
        name: "Export Fiscal Years",
        description: "Allows exporting fiscal years",
      },
    ],
  },

  {
    code: "NUMBERING_SEQUENCES",
    name: "Numbering Sequences",
    description: "Document numbering sequences",
    permissions: [
      {
        code: "numbering_sequences.view",
        action: "VIEW",
        name: "View Numbering Sequences",
        description: "Allows viewing numbering sequences",
      },
      {
        code: "numbering_sequences.update",
        action: "UPDATE",
        name: "Update Numbering Sequences",
        description: "Allows updating numbering sequences",
      },
      {
        code: "numbering_sequences.reset",
        action: "RESET_PASSWORD",
        name: "Reset Numbering Sequences",
        description: "Allows resetting numbering sequences",
      },
      {
        code: "numbering_sequences.export",
        action: "EXPORT",
        name: "Export Numbering Sequences",
        description: "Allows exporting numbering sequences",
      },
    ],
  },

  {
    code: "BUSINESS_SETTINGS",
    name: "Business Settings",
    description: "Business settings management",
    permissions: [
      {
        code: "business_settings.view",
        action: "VIEW",
        name: "View Business Settings",
        description: "Allows viewing business settings",
      },
      {
        code: "business_settings.update",
        action: "UPDATE",
        name: "Update Business Settings",
        description: "Allows updating business settings",
      },
      {
        code: "business_settings.export",
        action: "EXPORT",
        name: "Export Business Settings",
        description: "Allows exporting business settings",
      },
    ],
  },
];