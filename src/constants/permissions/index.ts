export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: "dashboard.view",
  },

  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    UPDATE: "users.update",
    DELETE: "users.delete",
  },

  ROLES: {
    VIEW: "roles.view",
    CREATE: "roles.create",
    UPDATE: "roles.update",
    DELETE: "roles.delete",
    ASSIGN: "roles.assign",
  },

  PERMISSIONS: {
    VIEW: "permissions.view",
    MANAGE: "permissions.manage",
  },

  BUSINESSES: {
    VIEW: "businesses.view",
    UPDATE: "businesses.update",
  },

  BRANCHES: {
    VIEW: "branches.view",
    CREATE: "branches.create",
    UPDATE: "branches.update",
    DELETE: "branches.delete",
  },

  WAREHOUSES: {
    VIEW: "warehouses.view",
    CREATE: "warehouses.create",
    UPDATE: "warehouses.update",
    DELETE: "warehouses.delete",
  },

  PRODUCTS: {
    VIEW: "products.view",
    CREATE: "products.create",
    UPDATE: "products.update",
    DELETE: "products.delete",
  },

  SALES: {
    VIEW: "sales.view",
    CREATE: "sales.create",
    UPDATE: "sales.update",
    DELETE: "sales.delete",
    VOID: "sales.void",
  },

  PURCHASES: {
    VIEW: "purchases.view",
    CREATE: "purchases.create",
    UPDATE: "purchases.update",
    DELETE: "purchases.delete",
  },

  STOCK: {
    VIEW: "stock.view",
    ADJUST: "stock.adjust",
    TRANSFER: "stock.transfer",
  },

  CUSTOMERS: {
    VIEW: "customers.view",
    CREATE: "customers.create",
    UPDATE: "customers.update",
    DELETE: "customers.delete",
  },

  SUPPLIERS: {
    VIEW: "suppliers.view",
    CREATE: "suppliers.create",
    UPDATE: "suppliers.update",
    DELETE: "suppliers.delete",
  },

  FINANCE: {
    VIEW: "finance.view",
    POST: "finance.post",
  },

  REPORTS: {
    VIEW: "reports.view",
    EXPORT: "reports.export",
  },

  SETTINGS: {
    VIEW: "settings.view",
    UPDATE: "settings.update",
  },
} as const;