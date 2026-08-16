import type { PermissionModule } from "../../types";

export const USERS_PERMISSION_MODULES: PermissionModule[] = [
  {
    code: "USERS",
    name: "Users",
    description: "User management and security",
    permissions: [
      {
        code: "users.view",
        action: "VIEW",
        name: "View Users",
        description: "Allows viewing users",
      },
      {
        code: "users.create",
        action: "CREATE",
        name: "Create Users",
        description: "Allows creating users",
      },
      {
        code: "users.update",
        action: "UPDATE",
        name: "Update Users",
        description: "Allows updating users",
      },
      {
        code: "users.delete",
        action: "DELETE",
        name: "Delete Users",
        description: "Allows deleting users",
      },
      {
        code: "users.activate",
        action: "ACTIVATE",
        name: "Activate Users",
        description: "Allows activating users",
      },
      {
        code: "users.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Users",
        description: "Allows deactivating users",
      },
      {
        code: "users.reset_password",
        action: "RESET_PASSWORD",
        name: "Reset User Password",
        description: "Allows resetting user passwords",
      },
      {
        code: "users.assign_role",
        action: "ASSIGN_ROLE",
        name: "Assign User Roles",
        description: "Allows assigning roles to users",
      },
      {
        code: "users.export",
        action: "EXPORT",
        name: "Export Users",
        description: "Allows exporting users",
      },
      {
        code: "users.impersonate",
        action: "IMPERSONATE",
        name: "Impersonate Users",
        description: "Allows logging in as another user",
      },
    ],
  },

  {
    code: "ROLES",
    name: "Roles",
    description: "Role management",
    permissions: [
      {
        code: "roles.view",
        action: "VIEW",
        name: "View Roles",
        description: "Allows viewing roles",
      },
      {
        code: "roles.create",
        action: "CREATE",
        name: "Create Roles",
        description: "Allows creating roles",
      },
      {
        code: "roles.update",
        action: "UPDATE",
        name: "Update Roles",
        description: "Allows updating roles",
      },
      {
        code: "roles.delete",
        action: "DELETE",
        name: "Delete Roles",
        description: "Allows deleting roles",
      },
      {
        code: "roles.assign_permissions",
       action: "ASSIGN_PERMISSION",
        name: "Assign Permissions",
        description: "Allows assigning permissions to roles",
      },
      {
        code: "roles.export",
        action: "EXPORT",
        name: "Export Roles",
        description: "Allows exporting roles",
      },
    ],
  },

  {
    code: "PERMISSIONS",
    name: "Permissions",
    description: "Permission management",
    permissions: [
      {
        code: "permissions.view",
        action: "VIEW",
        name: "View Permissions",
        description: "Allows viewing permissions",
      },
      {
        code: "permissions.export",
        action: "EXPORT",
        name: "Export Permissions",
        description: "Allows exporting permissions",
      },
    ],
  },
];