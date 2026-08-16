import type {
  PermissionModule,
} from "./types";

/**
 * Canonical GetAxe ERP Permission Registry
 *
 * IMPORTANT
 * ----------
 * This registry defines the complete authorization vocabulary of the ERP.
 *
 * It is intentionally broader than the currently implemented modules.
 * Permissions may therefore exist before the corresponding feature is built.
 *
 * Roles are NOT represented here.
 * A permission simply describes an operation that can be authorized.
 *
 * System roles receive default permission bundles elsewhere.
 * Those defaults are customizable and are NOT authorization boundaries.
 *
 * Canonical code format:
 *
 *   <resource>.<action>
 *
 * Examples:
 *
 *   products.view
 *   products.create
 *   inventory.stock.receive
 *   sales.payments.receive
 *
 * Avoid creating duplicate vocabulary such as:
 *
 *   sale.create
 *   sales.create
 *
 * The catalogue should have one canonical permission for one capability.
 */

export const PERMISSION_REGISTRY: readonly PermissionModule[] = [

  // ===========================================================================
  // DASHBOARD
  // ===========================================================================

  {
    code: "DASHBOARD",
    name: "Dashboard",
    description: "Dashboard and business overview",

    permissions: [
      {
        code: "dashboard.view",
        action: "VIEW",
        name: "View Dashboard",
        description: "Allows viewing the dashboard",
      },
    ],
  },

  // ===========================================================================
  // BUSINESS
  // ===========================================================================

  {
    code: "BUSINESS",
    name: "Business",
    description: "Business identity and configuration",

    permissions: [
      {
        code: "business.view",
        action: "VIEW",
        name: "View Business",
        description: "Allows viewing business information",
      },
      {
        code: "business.create",
        action: "CREATE",
        name: "Create Business",
        description: "Allows creating a business",
      },
      {
        code: "business.update",
        action: "UPDATE",
        name: "Update Business",
        description: "Allows updating business information",
      },
      {
        code: "business.delete",
        action: "DELETE",
        name: "Delete Business",
        description: "Allows deleting a business",
      },
      {
        code: "business.activate",
        action: "ACTIVATE",
        name: "Activate Business",
        description: "Allows activating a business",
      },
      {
        code: "business.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Business",
        description: "Allows deactivating a business",
      },
      {
        code: "business.export",
        action: "EXPORT",
        name: "Export Business",
        description: "Allows exporting business information",
      },
    ],
  },

  // ===========================================================================
  // BRANCHES
  // ===========================================================================

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

  // ===========================================================================
  // WAREHOUSES
  // ===========================================================================

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

  // ===========================================================================
  // BUSINESS SETTINGS
  // ===========================================================================

  {
    code: "BUSINESS_SETTINGS",
    name: "Business Settings",
    description: "Business configuration",

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
        code: "business_settings.configure",
        action: "CONFIGURE",
        name: "Configure Business Settings",
        description: "Allows configuring business settings",
      },
      {
        code: "business_settings.export",
        action: "EXPORT",
        name: "Export Business Settings",
        description: "Allows exporting business settings",
      },
    ],
  },

  // ===========================================================================
  // USERS
  // ===========================================================================

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
        code: "users.impersonate",
        action: "IMPERSONATE",
        name: "Impersonate Users",
        description: "Allows impersonating users",
      },
      {
        code: "users.import",
        action: "IMPORT",
        name: "Import Users",
        description: "Allows importing users",
      },
      {
        code: "users.export",
        action: "EXPORT",
        name: "Export Users",
        description: "Allows exporting users",
      },
    ],
  },

  // ===========================================================================
  // ROLES
  // ===========================================================================

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
        code: "roles.assign_permission",
        action: "ASSIGN_PERMISSION",
        name: "Assign Role Permissions",
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

  // ===========================================================================
  // PERMISSIONS
  // ===========================================================================

  {
    code: "PERMISSIONS",
    name: "Permissions",
    description: "Permission catalogue management",

    permissions: [
      {
        code: "permissions.view",
        action: "VIEW",
        name: "View Permissions",
        description: "Allows viewing permissions",
      },
      {
        code: "permissions.create",
        action: "CREATE",
        name: "Create Permissions",
        description: "Allows creating permissions",
      },
      {
        code: "permissions.update",
        action: "UPDATE",
        name: "Update Permissions",
        description: "Allows updating permissions",
      },
      {
        code: "permissions.activate",
        action: "ACTIVATE",
        name: "Activate Permissions",
        description: "Allows activating permissions",
      },
      {
        code: "permissions.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Permissions",
        description: "Allows deactivating permissions",
      },
      {
        code: "permissions.export",
        action: "EXPORT",
        name: "Export Permissions",
        description: "Allows exporting permissions",
      },
    ],
  },

  // ===========================================================================
  // UNITS
  // ===========================================================================

  {
    code: "UNITS",
    name: "Units",
    description: "Measurement unit management",

    permissions: [
      {
        code: "units.view",
        action: "VIEW",
        name: "View Units",
        description: "Allows viewing units",
      },
      {
        code: "units.create",
        action: "CREATE",
        name: "Create Units",
        description: "Allows creating units",
      },
      {
        code: "units.update",
        action: "UPDATE",
        name: "Update Units",
        description: "Allows updating units",
      },
      {
        code: "units.delete",
        action: "DELETE",
        name: "Delete Units",
        description: "Allows deleting units",
      },
      {
        code: "units.activate",
        action: "ACTIVATE",
        name: "Activate Units",
        description: "Allows activating units",
      },
      {
        code: "units.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Units",
        description: "Allows deactivating units",
      },
      {
        code: "units.export",
        action: "EXPORT",
        name: "Export Units",
        description: "Allows exporting units",
      },
    ],
  },

  // ===========================================================================
  // CATEGORIES
  // ===========================================================================

  {
    code: "CATEGORIES",
    name: "Categories",
    description: "Product category management",

    permissions: [
      {
        code: "categories.view",
        action: "VIEW",
        name: "View Categories",
        description: "Allows viewing categories",
      },
      {
        code: "categories.create",
        action: "CREATE",
        name: "Create Categories",
        description: "Allows creating categories",
      },
      {
        code: "categories.update",
        action: "UPDATE",
        name: "Update Categories",
        description: "Allows updating categories",
      },
      {
        code: "categories.delete",
        action: "DELETE",
        name: "Delete Categories",
        description: "Allows deleting categories",
      },
      {
        code: "categories.activate",
        action: "ACTIVATE",
        name: "Activate Categories",
        description: "Allows activating categories",
      },
      {
        code: "categories.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Categories",
        description: "Allows deactivating categories",
      },
      {
        code: "categories.export",
        action: "EXPORT",
        name: "Export Categories",
        description: "Allows exporting categories",
      },
    ],
  },

  // ===========================================================================
  // PRODUCTS
  // ===========================================================================

  {
    code: "PRODUCTS",
    name: "Products",
    description: "Product catalogue management",

    permissions: [
      {
        code: "products.view",
        action: "VIEW",
        name: "View Products",
        description: "Allows viewing products",
      },
      {
        code: "products.create",
        action: "CREATE",
        name: "Create Products",
        description: "Allows creating products",
      },
      {
        code: "products.update",
        action: "UPDATE",
        name: "Update Products",
        description: "Allows updating products",
      },
      {
        code: "products.delete",
        action: "DELETE",
        name: "Delete Products",
        description: "Allows deleting products",
      },
      {
        code: "products.activate",
        action: "ACTIVATE",
        name: "Activate Products",
        description: "Allows activating products",
      },
      {
        code: "products.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Products",
        description: "Allows deactivating products",
      },
      {
        code: "products.import",
        action: "IMPORT",
        name: "Import Products",
        description: "Allows importing products",
      },
      {
        code: "products.export",
        action: "EXPORT",
        name: "Export Products",
        description: "Allows exporting products",
      },
      {
        code: "products.adjust_price",
        action: "ADJUST",
        name: "Adjust Product Prices",
        description: "Allows adjusting product prices",
      },
      {
        code: "products.adjust_cost",
        action: "ADJUST",
        name: "Adjust Product Cost",
        description: "Allows adjusting product cost",
      },
    ],
  },

  // ===========================================================================
  // PRICE LISTS
  // ===========================================================================

  {
    code: "PRICE_LISTS",
    name: "Price Lists",
    description: "Sales and customer price lists",

    permissions: [
      {
        code: "price_lists.view",
        action: "VIEW",
        name: "View Price Lists",
        description: "Allows viewing price lists",
      },
      {
        code: "price_lists.create",
        action: "CREATE",
        name: "Create Price Lists",
        description: "Allows creating price lists",
      },
      {
        code: "price_lists.update",
        action: "UPDATE",
        name: "Update Price Lists",
        description: "Allows updating price lists",
      },
      {
        code: "price_lists.delete",
        action: "DELETE",
        name: "Delete Price Lists",
        description: "Allows deleting price lists",
      },
      {
        code: "price_lists.activate",
        action: "ACTIVATE",
        name: "Activate Price Lists",
        description: "Allows activating price lists",
      },
      {
        code: "price_lists.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Price Lists",
        description: "Allows deactivating price lists",
      },
      {
        code: "price_lists.export",
        action: "EXPORT",
        name: "Export Price Lists",
        description: "Allows exporting price lists",
      },
    ],
  },

  // ===========================================================================
  // PRODUCT PRICES
  // ===========================================================================

  {
    code: "PRODUCT_PRICES",
    name: "Product Prices",
    description: "Product pricing",

    permissions: [
      {
        code: "product_prices.view",
        action: "VIEW",
        name: "View Product Prices",
        description: "Allows viewing product prices",
      },
      {
        code: "product_prices.create",
        action: "CREATE",
        name: "Create Product Prices",
        description: "Allows creating product prices",
      },
      {
        code: "product_prices.update",
        action: "UPDATE",
        name: "Update Product Prices",
        description: "Allows updating product prices",
      },
      {
        code: "product_prices.delete",
        action: "DELETE",
        name: "Delete Product Prices",
        description: "Allows deleting product prices",
      },
      {
        code: "product_prices.export",
        action: "EXPORT",
        name: "Export Product Prices",
        description: "Allows exporting product prices",
      },
    ],
  },

  // ===========================================================================
  // PRODUCT BATCHES
  // ===========================================================================

  {
    code: "PRODUCT_BATCHES",
    name: "Product Batches",
    description: "Batch and expiry management",

    permissions: [
      {
        code: "product_batches.view",
        action: "VIEW",
        name: "View Product Batches",
        description: "Allows viewing product batches",
      },
      {
        code: "product_batches.create",
        action: "CREATE",
        name: "Create Product Batches",
        description: "Allows creating product batches",
      },
      {
        code: "product_batches.update",
        action: "UPDATE",
        name: "Update Product Batches",
        description: "Allows updating product batches",
      },
      {
        code: "product_batches.delete",
        action: "DELETE",
        name: "Delete Product Batches",
        description: "Allows deleting product batches",
      },
      {
        code: "product_batches.export",
        action: "EXPORT",
        name: "Export Product Batches",
        description: "Allows exporting product batches",
      },
    ],
  },

  // ===========================================================================
  // STOCK
  // ===========================================================================

  {
    code: "STOCK",
    name: "Stock",
    description: "Inventory stock operations",

    permissions: [
      {
        code: "stock.view",
        action: "VIEW",
        name: "View Stock",
        description: "Allows viewing stock balances and availability",
      },
      {
        code: "stock.receive",
        action: "RECEIVE",
        name: "Receive Stock",
        description: "Allows receiving stock into inventory",
      },
      {
        code: "stock.issue",
        action: "ISSUE",
        name: "Issue Stock",
        description: "Allows issuing stock from inventory",
      },
      {
        code: "stock.adjust",
        action: "ADJUST",
        name: "Adjust Stock",
        description: "Allows adjusting stock quantities",
      },
      {
        code: "stock.transfer",
        action: "TRANSFER",
        name: "Transfer Stock",
        description: "Allows transferring stock between locations",
      },
      {
        code: "stock.allocate",
        action: "ALLOCATE",
        name: "Allocate Stock",
        description: "Allows reserving stock for operational workflows",
      },
      {
        code: "stock.release",
        action: "RELEASE",
        name: "Release Stock",
        description: "Allows releasing reserved stock",
      },
      {
        code: "stock.freeze",
        action: "FREEZE",
        name: "Freeze Stock",
        description: "Allows freezing stock where supported",
      },
      {
        code: "stock.unfreeze",
        action: "UNFREEZE",
        name: "Unfreeze Stock",
        description: "Allows unfreezing stock where supported",
      },
    ],
  },

  // ===========================================================================
  // STOCK MOVEMENTS
  // ===========================================================================

  {
    code: "STOCK_MOVEMENTS",
    name: "Stock Movements",
    description: "Inventory movement history",

    permissions: [
      {
        code: "stock_movements.view",
        action: "VIEW",
        name: "View Stock Movements",
        description: "Allows viewing stock movement history",
      },
      {
        code: "stock_movements.export",
        action: "EXPORT",
        name: "Export Stock Movements",
        description: "Allows exporting stock movement history",
      },
    ],
  },

  // ===========================================================================
  // STOCK ADJUSTMENTS
  // ===========================================================================

  {
    code: "STOCK_ADJUSTMENTS",
    name: "Stock Adjustments",
    description: "Inventory stock adjustments",

    permissions: [
      {
        code: "stock_adjustments.view",
        action: "VIEW",
        name: "View Stock Adjustments",
        description: "Allows viewing stock adjustments",
      },
      {
        code: "stock_adjustments.create",
        action: "CREATE",
        name: "Create Stock Adjustments",
        description: "Allows creating stock adjustments",
      },
      {
        code: "stock_adjustments.approve",
        action: "APPROVE",
        name: "Approve Stock Adjustments",
        description: "Allows approving stock adjustments",
      },
      {
        code: "stock_adjustments.cancel",
        action: "CANCEL",
        name: "Cancel Stock Adjustments",
        description: "Allows cancelling stock adjustments",
      },
      {
        code: "stock_adjustments.export",
        action: "EXPORT",
        name: "Export Stock Adjustments",
        description: "Allows exporting stock adjustments",
      },
    ],
  },

  // ===========================================================================
  // STOCK TRANSFERS
  // ===========================================================================

  {
    code: "STOCK_TRANSFERS",
    name: "Stock Transfers",
    description: "Warehouse stock transfers",

    permissions: [
      {
        code: "stock_transfers.view",
        action: "VIEW",
        name: "View Stock Transfers",
        description: "Allows viewing stock transfers",
      },
      {
        code: "stock_transfers.create",
        action: "CREATE",
        name: "Create Stock Transfers",
        description: "Allows creating stock transfers",
      },
      {
        code: "stock_transfers.approve",
        action: "APPROVE",
        name: "Approve Stock Transfers",
        description: "Allows approving stock transfers",
      },
      {
        code: "stock_transfers.dispatch",
        action: "DISPATCH",
        name: "Dispatch Stock Transfers",
        description: "Allows dispatching stock transfers",
      },
      {
        code: "stock_transfers.receive",
        action: "RECEIVE",
        name: "Receive Stock Transfers",
        description: "Allows receiving stock transfers",
      },
      {
        code: "stock_transfers.cancel",
        action: "CANCEL",
        name: "Cancel Stock Transfers",
        description: "Allows cancelling stock transfers",
      },
      {
        code: "stock_transfers.export",
        action: "EXPORT",
        name: "Export Stock Transfers",
        description: "Allows exporting stock transfers",
      },
    ],
  },

  // ===========================================================================
  // CUSTOMERS
  // ===========================================================================

  {
    code: "CUSTOMERS",
    name: "Customers",
    description: "Customer relationship management",

    permissions: [
      {
        code: "customers.view",
        action: "VIEW",
        name: "View Customers",
        description: "Allows viewing customers",
      },
      {
        code: "customers.create",
        action: "CREATE",
        name: "Create Customers",
        description: "Allows creating customers",
      },
      {
        code: "customers.update",
        action: "UPDATE",
        name: "Update Customers",
        description: "Allows updating customers",
      },
      {
        code: "customers.delete",
        action: "DELETE",
        name: "Delete Customers",
        description: "Allows deleting customers",
      },
      {
        code: "customers.activate",
        action: "ACTIVATE",
        name: "Activate Customers",
        description: "Allows activating customers",
      },
      {
        code: "customers.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Customers",
        description: "Allows deactivating customers",
      },
      {
        code: "customers.export",
        action: "EXPORT",
        name: "Export Customers",
        description: "Allows exporting customers",
      },
    ],
  },

  // ===========================================================================
  // SUPPLIERS
  // ===========================================================================

  {
    code: "SUPPLIERS",
    name: "Suppliers",
    description: "Supplier management",

    permissions: [
      {
        code: "suppliers.view",
        action: "VIEW",
        name: "View Suppliers",
        description: "Allows viewing suppliers",
      },
      {
        code: "suppliers.create",
        action: "CREATE",
        name: "Create Suppliers",
        description: "Allows creating suppliers",
      },
      {
        code: "suppliers.update",
        action: "UPDATE",
        name: "Update Suppliers",
        description: "Allows updating suppliers",
      },
      {
        code: "suppliers.delete",
        action: "DELETE",
        name: "Delete Suppliers",
        description: "Allows deleting suppliers",
      },
      {
        code: "suppliers.activate",
        action: "ACTIVATE",
        name: "Activate Suppliers",
        description: "Allows activating suppliers",
      },
      {
        code: "suppliers.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Suppliers",
        description: "Allows deactivating suppliers",
      },
      {
        code: "suppliers.export",
        action: "EXPORT",
        name: "Export Suppliers",
        description: "Allows exporting suppliers",
      },
    ],
  },

  // ===========================================================================
  // PURCHASE ORDERS
  // ===========================================================================

  {
    code: "PURCHASE_ORDERS",
    name: "Purchase Orders",
    description: "Purchase order management",

    permissions: [
      {
        code: "purchase_orders.view",
        action: "VIEW",
        name: "View Purchase Orders",
        description: "Allows viewing purchase orders",
      },
      {
        code: "purchase_orders.create",
        action: "CREATE",
        name: "Create Purchase Orders",
        description: "Allows creating purchase orders",
      },
      {
        code: "purchase_orders.update",
        action: "UPDATE",
        name: "Update Purchase Orders",
        description: "Allows updating draft purchase orders",
      },
      {
        code: "purchase_orders.delete",
        action: "DELETE",
        name: "Delete Purchase Orders",
        description: "Allows deleting draft purchase orders",
      },
      {
        code: "purchase_orders.approve",
        action: "APPROVE",
        name: "Approve Purchase Orders",
        description: "Allows approving purchase orders",
      },
      {
        code: "purchase_orders.send",
        action: "EXECUTE",
        name: "Send Purchase Orders",
        description: "Allows sending purchase orders to suppliers",
      },
      {
        code: "purchase_orders.cancel",
        action: "CANCEL",
        name: "Cancel Purchase Orders",
        description: "Allows cancelling purchase orders",
      },
      {
        code: "purchase_orders.close",
        action: "CLOSE",
        name: "Close Purchase Orders",
        description: "Allows closing purchase orders",
      },
      {
        code: "purchase_orders.print",
        action: "PRINT",
        name: "Print Purchase Orders",
        description: "Allows printing purchase orders",
      },
      {
        code: "purchase_orders.export",
        action: "EXPORT",
        name: "Export Purchase Orders",
        description: "Allows exporting purchase orders",
      },
    ],
  },

  // ===========================================================================
  // GOODS RECEIPTS
  // ===========================================================================

  {
    code: "GOODS_RECEIPTS",
    name: "Goods Receipts",
    description: "Goods receipt processing",

    permissions: [
      {
        code: "goods_receipts.view",
        action: "VIEW",
        name: "View Goods Receipts",
        description: "Allows viewing goods receipts",
      },
      {
        code: "goods_receipts.create",
        action: "CREATE",
        name: "Create Goods Receipts",
        description: "Allows receiving goods",
      },
      {
        code: "goods_receipts.post",
        action: "POST",
        name: "Post Goods Receipts",
        description: "Allows posting goods receipts to inventory",
      },
      {
        code: "goods_receipts.cancel",
        action: "CANCEL",
        name: "Cancel Goods Receipts",
        description: "Allows cancelling goods receipts",
      },
      {
        code: "goods_receipts.print",
        action: "PRINT",
        name: "Print Goods Receipts",
        description: "Allows printing goods receipts",
      },
      {
        code: "goods_receipts.export",
        action: "EXPORT",
        name: "Export Goods Receipts",
        description: "Allows exporting goods receipts",
      },
    ],
  },

  // ===========================================================================
  // SUPPLIER RETURNS
  // ===========================================================================

  {
    code: "SUPPLIER_RETURNS",
    name: "Supplier Returns",
    description: "Supplier return management",

    permissions: [
      {
        code: "supplier_returns.view",
        action: "VIEW",
        name: "View Supplier Returns",
        description: "Allows viewing supplier returns",
      },
      {
        code: "supplier_returns.create",
        action: "CREATE",
        name: "Create Supplier Returns",
        description: "Allows creating supplier returns",
      },
      {
        code: "supplier_returns.approve",
        action: "APPROVE",
        name: "Approve Supplier Returns",
        description: "Allows approving supplier returns",
      },
      {
        code: "supplier_returns.post",
        action: "POST",
        name: "Post Supplier Returns",
        description: "Allows posting supplier returns",
      },
      {
        code: "supplier_returns.cancel",
        action: "CANCEL",
        name: "Cancel Supplier Returns",
        description: "Allows cancelling supplier returns",
      },
      {
        code: "supplier_returns.print",
        action: "PRINT",
        name: "Print Supplier Returns",
        description: "Allows printing supplier returns",
      },
      {
        code: "supplier_returns.export",
        action: "EXPORT",
        name: "Export Supplier Returns",
        description: "Allows exporting supplier returns",
      },
    ],
  },

  // ===========================================================================
  // SALES
  // ===========================================================================

  {
    code: "SALES",
    name: "Sales",
    description: "Sales transaction management",

    permissions: [
      {
        code: "sales.view",
        action: "VIEW",
        name: "View Sales",
        description: "Allows viewing sales",
      },
      {
        code: "sales.create",
        action: "CREATE",
        name: "Create Sales",
        description: "Allows creating sales",
      },
      {
        code: "sales.update",
        action: "UPDATE",
        name: "Update Sales",
        description: "Allows updating eligible sales",
      },
      {
        code: "sales.complete",
        action: "COMPLETE",
        name: "Complete Sales",
        description: "Allows completing sales",
      },
      {
        code: "sales.void",
        action: "VOID",
        name: "Void Sales",
        description: "Allows voiding sales",
      },
      {
        code: "sales.cancel",
        action: "CANCEL",
        name: "Cancel Sales",
        description: "Allows cancelling eligible sales",
      },
      {
        code: "sales.print",
        action: "PRINT",
        name: "Print Sales",
        description: "Allows printing sales documents",
      },
      {
        code: "sales.export",
        action: "EXPORT",
        name: "Export Sales",
        description: "Allows exporting sales",
      },
    ],
  },

  // ===========================================================================
  // SALES PAYMENTS
  // ===========================================================================

  {
    code: "SALES_PAYMENTS",
    name: "Sales Payments",
    description: "Customer payment processing",

    permissions: [
      {
        code: "sales.payments.view",
        action: "VIEW",
        name: "View Sales Payments",
        description: "Allows viewing sales payments",
      },
      {
        code: "sales.payments.receive",
        action: "RECEIVE_PAYMENT",
        name: "Receive Sales Payments",
        description: "Allows receiving customer payments",
      },
      {
        code: "sales.payments.reverse",
        action: "REVERSE_PAYMENT",
        name: "Reverse Sales Payments",
        description: "Allows reversing customer payments",
      },
      {
        code: "sales.payments.export",
        action: "EXPORT",
        name: "Export Sales Payments",
        description: "Allows exporting sales payment records",
      },
    ],
  },

  // ===========================================================================
  // SALES RETURNS
  // ===========================================================================

  {
    code: "SALES_RETURNS",
    name: "Sales Returns",
    description: "Customer sales returns",

    permissions: [
      {
        code: "sales.returns.view",
        action: "VIEW",
        name: "View Sales Returns",
        description: "Allows viewing sales returns",
      },
      {
        code: "sales.returns.create",
        action: "CREATE",
        name: "Create Sales Returns",
        description: "Allows creating sales returns",
      },
      {
        code: "sales.returns.approve",
        action: "APPROVE",
        name: "Approve Sales Returns",
        description: "Allows approving sales returns",
      },
      {
        code: "sales.returns.post",
        action: "POST",
        name: "Post Sales Returns",
        description: "Allows posting sales returns",
      },
      {
        code: "sales.returns.cancel",
        action: "CANCEL",
        name: "Cancel Sales Returns",
        description: "Allows cancelling sales returns",
      },
      {
        code: "sales.returns.refund",
        action: "REFUND",
        name: "Refund Sales Returns",
        description: "Allows refunding customer returns",
      },
      {
        code: "sales.returns.exchange",
        action: "EXCHANGE",
        name: "Exchange Returned Goods",
        description: "Allows processing exchanges",
      },
      {
        code: "sales.returns.export",
        action: "EXPORT",
        name: "Export Sales Returns",
        description: "Allows exporting sales returns",
      },
    ],
  },

  // ===========================================================================
  // QUOTATIONS
  // ===========================================================================

  {
    code: "QUOTATIONS",
    name: "Quotations",
    description: "Sales quotation management",

    permissions: [
      {
        code: "quotations.view",
        action: "VIEW",
        name: "View Quotations",
        description: "Allows viewing quotations",
      },
      {
        code: "quotations.create",
        action: "CREATE",
        name: "Create Quotations",
        description: "Allows creating quotations",
      },
      {
        code: "quotations.update",
        action: "UPDATE",
        name: "Update Quotations",
        description: "Allows updating quotations",
      },
      {
        code: "quotations.delete",
        action: "DELETE",
        name: "Delete Quotations",
        description: "Allows deleting quotations",
      },
      {
        code: "quotations.approve",
        action: "APPROVE",
        name: "Approve Quotations",
        description: "Allows approving quotations",
      },
      {
        code: "quotations.cancel",
        action: "CANCEL",
        name: "Cancel Quotations",
        description: "Allows cancelling quotations",
      },
      {
        code: "quotations.convert",
        action: "CONVERT",
        name: "Convert Quotations",
        description: "Allows converting quotations into sales orders",
      },
      {
        code: "quotations.print",
        action: "PRINT",
        name: "Print Quotations",
        description: "Allows printing quotations",
      },
      {
        code: "quotations.export",
        action: "EXPORT",
        name: "Export Quotations",
        description: "Allows exporting quotations",
      },
    ],
  },

  // ===========================================================================
  // SALES ORDERS
  // ===========================================================================

  {
    code: "SALES_ORDERS",
    name: "Sales Orders",
    description: "Customer sales order management",

    permissions: [
      {
        code: "sales.orders.view",
        action: "VIEW",
        name: "View Sales Orders",
        description: "Allows viewing sales orders",
      },
      {
        code: "sales.orders.create",
        action: "CREATE",
        name: "Create Sales Orders",
        description: "Allows creating sales orders",
      },
      {
        code: "sales.orders.update",
        action: "UPDATE",
        name: "Update Sales Orders",
        description: "Allows updating sales orders",
      },
      {
        code: "sales.orders.delete",
        action: "DELETE",
        name: "Delete Sales Orders",
        description: "Allows deleting eligible sales orders",
      },
      {
        code: "sales.orders.approve",
        action: "APPROVE",
        name: "Approve Sales Orders",
        description: "Allows approving sales orders",
      },
      {
        code: "sales.orders.cancel",
        action: "CANCEL",
        name: "Cancel Sales Orders",
        description: "Allows cancelling sales orders",
      },
      {
        code: "sales.orders.complete",
        action: "COMPLETE",
        name: "Complete Sales Orders",
        description: "Allows completing sales orders",
      },
      {
        code: "sales.orders.export",
        action: "EXPORT",
        name: "Export Sales Orders",
        description: "Allows exporting sales orders",
      },
    ],
  },

  // ===========================================================================
  // DELIVERIES
  // ===========================================================================

  {
    code: "DELIVERIES",
    name: "Deliveries",
    description: "Sales delivery management",

    permissions: [
      {
        code: "deliveries.view",
        action: "VIEW",
        name: "View Deliveries",
        description: "Allows viewing deliveries",
      },
      {
        code: "deliveries.create",
        action: "CREATE",
        name: "Create Deliveries",
        description: "Allows creating deliveries",
      },
      {
        code: "deliveries.update",
        action: "UPDATE",
        name: "Update Deliveries",
        description: "Allows updating deliveries",
      },
      {
        code: "deliveries.dispatch",
        action: "DISPATCH",
        name: "Dispatch Deliveries",
        description: "Allows dispatching deliveries",
      },
      {
        code: "deliveries.complete",
        action: "COMPLETE",
        name: "Complete Deliveries",
        description: "Allows completing deliveries",
      },
      {
        code: "deliveries.cancel",
        action: "CANCEL",
        name: "Cancel Deliveries",
        description: "Allows cancelling deliveries",
      },
      {
        code: "deliveries.print",
        action: "PRINT",
        name: "Print Deliveries",
        description: "Allows printing delivery documents",
      },
      {
        code: "deliveries.export",
        action: "EXPORT",
        name: "Export Deliveries",
        description: "Allows exporting deliveries",
      },
    ],
  },

  // ===========================================================================
  // DISCOUNTS
  // ===========================================================================

  {
    code: "DISCOUNTS",
    name: "Discounts",
    description: "Discount management",

    permissions: [
      {
        code: "discounts.view",
        action: "VIEW",
        name: "View Discounts",
        description: "Allows viewing discounts",
      },
      {
        code: "discounts.create",
        action: "CREATE",
        name: "Create Discounts",
        description: "Allows creating discounts",
      },
      {
        code: "discounts.update",
        action: "UPDATE",
        name: "Update Discounts",
        description: "Allows updating discounts",
      },
      {
        code: "discounts.delete",
        action: "DELETE",
        name: "Delete Discounts",
        description: "Allows deleting discounts",
      },
      {
        code: "discounts.approve",
        action: "APPROVE",
        name: "Approve Discounts",
        description: "Allows approving discounts",
      },
      {
        code: "discounts.apply",
        action: "APPLY",
        name: "Apply Discounts",
        description: "Allows applying authorized discounts",
      },
      {
        code: "discounts.export",
        action: "EXPORT",
        name: "Export Discounts",
        description: "Allows exporting discounts",
      },
    ],
  },

  // ===========================================================================
  // PROMOTIONS
  // ===========================================================================

  {
    code: "PROMOTIONS",
    name: "Promotions",
    description: "Promotion management",

    permissions: [
      {
        code: "promotions.view",
        action: "VIEW",
        name: "View Promotions",
        description: "Allows viewing promotions",
      },
      {
        code: "promotions.create",
        action: "CREATE",
        name: "Create Promotions",
        description: "Allows creating promotions",
      },
      {
        code: "promotions.update",
        action: "UPDATE",
        name: "Update Promotions",
        description: "Allows updating promotions",
      },
      {
        code: "promotions.delete",
        action: "DELETE",
        name: "Delete Promotions",
        description: "Allows deleting promotions",
      },
      {
        code: "promotions.activate",
        action: "ACTIVATE",
        name: "Activate Promotions",
        description: "Allows activating promotions",
      },
      {
        code: "promotions.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Promotions",
        description: "Allows deactivating promotions",
      },
      {
        code: "promotions.apply",
        action: "APPLY",
        name: "Apply Promotions",
        description: "Allows applying promotions",
      },
      {
        code: "promotions.export",
        action: "EXPORT",
        name: "Export Promotions",
        description: "Allows exporting promotions",
      },
    ],
  },

  // ===========================================================================
  // LOYALTY
  // ===========================================================================

  {
    code: "LOYALTY",
    name: "Loyalty",
    description: "Customer loyalty management",

    permissions: [
      {
        code: "loyalty.view",
        action: "VIEW",
        name: "View Loyalty",
        description: "Allows viewing loyalty information",
      },
      {
        code: "loyalty.manage",
        action: "MANAGE",
        name: "Manage Loyalty",
        description: "Allows managing loyalty configuration",
      },
      {
        code: "loyalty.earn",
        action: "EXECUTE",
        name: "Award Loyalty",
        description: "Allows awarding loyalty benefits",
      },
      {
        code: "loyalty.redeem",
        action: "EXECUTE",
        name: "Redeem Loyalty",
        description: "Allows redeeming loyalty benefits",
      },
      {
        code: "loyalty.adjust",
        action: "ADJUST",
        name: "Adjust Loyalty",
        description: "Allows adjusting loyalty balances",
      },
      {
        code: "loyalty.export",
        action: "EXPORT",
        name: "Export Loyalty",
        description: "Allows exporting loyalty information",
      },
    ],
  },

  // ===========================================================================
  // FINANCE
  // ===========================================================================

  {
    code: "FINANCE",
    name: "Finance",
    description: "Financial management",

    permissions: [
      {
        code: "finance.view",
        action: "VIEW",
        name: "View Finance",
        description: "Allows viewing financial information",
      },
      {
        code: "finance.post",
        action: "POST",
        name: "Post Financial Transactions",
        description: "Allows posting financial transactions",
      },
      {
        code: "finance.approve",
        action: "APPROVE",
        name: "Approve Financial Transactions",
        description: "Allows approving financial transactions",
      },
      {
        code: "finance.export",
        action: "EXPORT",
        name: "Export Financial Data",
        description: "Allows exporting financial data",
      },
    ],
  },

  // ===========================================================================
  // ACCOUNTS
  // ===========================================================================

  {
    code: "ACCOUNTS",
    name: "Accounts",
    description: "Chart of accounts management",

    permissions: [
      {
        code: "accounts.view",
        action: "VIEW",
        name: "View Accounts",
        description: "Allows viewing accounts",
      },
      {
        code: "accounts.create",
        action: "CREATE",
        name: "Create Accounts",
        description: "Allows creating accounts",
      },
      {
        code: "accounts.update",
        action: "UPDATE",
        name: "Update Accounts",
        description: "Allows updating accounts",
      },
      {
        code: "accounts.delete",
        action: "DELETE",
        name: "Delete Accounts",
        description: "Allows deleting accounts",
      },
      {
        code: "accounts.activate",
        action: "ACTIVATE",
        name: "Activate Accounts",
        description: "Allows activating accounts",
      },
      {
        code: "accounts.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Accounts",
        description: "Allows deactivating accounts",
      },
      {
        code: "accounts.export",
        action: "EXPORT",
        name: "Export Accounts",
        description: "Allows exporting accounts",
      },
    ],
  },

  // ===========================================================================
  // PAYMENTS
  // ===========================================================================

  {
    code: "PAYMENTS",
    name: "Payments",
    description: "Payment management",

    permissions: [
      {
        code: "payments.view",
        action: "VIEW",
        name: "View Payments",
        description: "Allows viewing payments",
      },
      {
        code: "payments.create",
        action: "CREATE",
        name: "Create Payments",
        description: "Allows creating payments",
      },
      {
        code: "payments.post",
        action: "POST",
        name: "Post Payments",
        description: "Allows posting payments",
      },
      {
        code: "payments.reverse",
        action: "REVERSE_PAYMENT",
        name: "Reverse Payments",
        description: "Allows reversing payments",
      },
      {
        code: "payments.reconcile",
        action: "RECONCILE",
        name: "Reconcile Payments",
        description: "Allows reconciling payments",
      },
      {
        code: "payments.export",
        action: "EXPORT",
        name: "Export Payments",
        description: "Allows exporting payments",
      },
    ],
  },

  // ===========================================================================
  // EXPENSES
  // ===========================================================================

  {
    code: "EXPENSES",
    name: "Expenses",
    description: "Expense management",

    permissions: [
      {
        code: "expenses.view",
        action: "VIEW",
        name: "View Expenses",
        description: "Allows viewing expenses",
      },
      {
        code: "expenses.create",
        action: "CREATE",
        name: "Create Expenses",
        description: "Allows creating expenses",
      },
      {
        code: "expenses.update",
        action: "UPDATE",
        name: "Update Expenses",
        description: "Allows updating expenses",
      },
      {
        code: "expenses.delete",
        action: "DELETE",
        name: "Delete Expenses",
        description: "Allows deleting expenses",
      },
      {
        code: "expenses.approve",
        action: "APPROVE",
        name: "Approve Expenses",
        description: "Allows approving expenses",
      },
      {
        code: "expenses.post",
        action: "POST",
        name: "Post Expenses",
        description: "Allows posting expenses",
      },
      {
        code: "expenses.cancel",
        action: "CANCEL",
        name: "Cancel Expenses",
        description: "Allows cancelling expenses",
      },
      {
        code: "expenses.export",
        action: "EXPORT",
        name: "Export Expenses",
        description: "Allows exporting expenses",
      },
    ],
  },

  // ===========================================================================
  // INCOME
  // ===========================================================================

  {
    code: "INCOME",
    name: "Income",
    description: "Income management",

    permissions: [
      {
        code: "income.view",
        action: "VIEW",
        name: "View Income",
        description: "Allows viewing income",
      },
      {
        code: "income.create",
        action: "CREATE",
        name: "Create Income",
        description: "Allows recording income",
      },
      {
        code: "income.update",
        action: "UPDATE",
        name: "Update Income",
        description: "Allows updating income records",
      },
      {
        code: "income.delete",
        action: "DELETE",
        name: "Delete Income",
        description: "Allows deleting eligible income records",
      },
      {
        code: "income.approve",
        action: "APPROVE",
        name: "Approve Income",
        description: "Allows approving income",
      },
      {
        code: "income.post",
        action: "POST",
        name: "Post Income",
        description: "Allows posting income",
      },
      {
        code: "income.export",
        action: "EXPORT",
        name: "Export Income",
        description: "Allows exporting income",
      },
    ],
  },

  // ===========================================================================
  // JOURNALS
  // ===========================================================================

  {
    code: "JOURNALS",
    name: "Journals",
    description: "Accounting journal management",

    permissions: [
      {
        code: "journals.view",
        action: "VIEW",
        name: "View Journals",
        description: "Allows viewing journals",
      },
      {
        code: "journals.create",
        action: "CREATE",
        name: "Create Journal Entries",
        description: "Allows creating journal entries",
      },
      {
        code: "journals.update",
        action: "UPDATE",
        name: "Update Journal Entries",
        description: "Allows updating eligible journal entries",
      },
      {
        code: "journals.delete",
        action: "DELETE",
        name: "Delete Journal Entries",
        description: "Allows deleting eligible journal entries",
      },
      {
        code: "journals.post",
        action: "POST",
        name: "Post Journal Entries",
        description: "Allows posting journal entries",
      },
      {
        code: "journals.reverse",
        action: "REVERSE_PAYMENT",
        name: "Reverse Journal Entries",
        description: "Allows reversing posted journal entries",
      },
      {
        code: "journals.export",
        action: "EXPORT",
        name: "Export Journals",
        description: "Allows exporting journals",
      },
    ],
  },

  // ===========================================================================
  // TAXES
  // ===========================================================================

  {
    code: "TAXES",
    name: "Taxes",
    description: "Tax configuration and processing",

    permissions: [
      {
        code: "taxes.view",
        action: "VIEW",
        name: "View Taxes",
        description: "Allows viewing tax configuration",
      },
      {
        code: "taxes.create",
        action: "CREATE",
        name: "Create Taxes",
        description: "Allows creating tax definitions",
      },
      {
        code: "taxes.update",
        action: "UPDATE",
        name: "Update Taxes",
        description: "Allows updating tax definitions",
      },
      {
        code: "taxes.delete",
        action: "DELETE",
        name: "Delete Taxes",
        description: "Allows deleting tax definitions",
      },
      {
        code: "taxes.activate",
        action: "ACTIVATE",
        name: "Activate Taxes",
        description: "Allows activating tax definitions",
      },
      {
        code: "taxes.deactivate",
        action: "DEACTIVATE",
        name: "Deactivate Taxes",
        description: "Allows deactivating tax definitions",
      },
      {
        code: "taxes.export",
        action: "EXPORT",
        name: "Export Taxes",
        description: "Allows exporting tax information",
      },
    ],
  },

  // ===========================================================================
  // FISCAL YEARS
  // ===========================================================================

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
        name: "Close Fiscal Years",
        description: "Allows closing fiscal years",
      },
      {
        code: "fiscal_years.reopen",
        action: "REOPEN",
        name: "Reopen Fiscal Years",
        description: "Allows reopening fiscal years",
      },
      {
        code: "fiscal_years.export",
        action: "EXPORT",
        name: "Export Fiscal Years",
        description: "Allows exporting fiscal years",
      },
    ],
  },

  // ===========================================================================
  // FISCAL PERIODS
  // ===========================================================================

  {
    code: "FISCAL_PERIODS",
    name: "Fiscal Periods",
    description: "Accounting period management",

    permissions: [
      {
        code: "fiscal_periods.view",
        action: "VIEW",
        name: "View Fiscal Periods",
        description: "Allows viewing fiscal periods",
      },
      {
        code: "fiscal_periods.create",
        action: "CREATE",
        name: "Create Fiscal Periods",
        description: "Allows creating fiscal periods",
      },
      {
        code: "fiscal_periods.update",
        action: "UPDATE",
        name: "Update Fiscal Periods",
        description: "Allows updating fiscal periods",
      },
      {
        code: "fiscal_periods.close",
        action: "CLOSE",
        name: "Close Fiscal Periods",
        description: "Allows closing fiscal periods",
      },
      {
        code: "fiscal_periods.reopen",
        action: "REOPEN",
        name: "Reopen Fiscal Periods",
        description: "Allows reopening fiscal periods",
      },
      {
        code: "fiscal_periods.export",
        action: "EXPORT",
        name: "Export Fiscal Periods",
        description: "Allows exporting fiscal periods",
      },
    ],
  },

  // ===========================================================================
  // RECONCILIATIONS
  // ===========================================================================

  {
    code: "RECONCILIATIONS",
    name: "Reconciliations",
    description: "Financial reconciliation",

    permissions: [
      {
        code: "reconciliations.view",
        action: "VIEW",
        name: "View Reconciliations",
        description: "Allows viewing reconciliations",
      },
      {
        code: "reconciliations.create",
        action: "CREATE",
        name: "Create Reconciliations",
        description: "Allows creating reconciliations",
      },
      {
        code: "reconciliations.reconcile",
        action: "RECONCILE",
        name: "Reconcile Accounts",
        description: "Allows reconciling accounts",
      },
      {
        code: "reconciliations.approve",
        action: "APPROVE",
        name: "Approve Reconciliations",
        description: "Allows approving reconciliations",
      },
      {
        code: "reconciliations.export",
        action: "EXPORT",
        name: "Export Reconciliations",
        description: "Allows exporting reconciliations",
      },
    ],
  },

  // ===========================================================================
  // REPORTS
  // ===========================================================================

  {
    code: "REPORTS",
    name: "Reports",
    description: "Business reporting",

    permissions: [
      {
        code: "reports.view",
        action: "VIEW",
        name: "View Reports",
        description: "Allows viewing reports",
      },
      {
        code: "reports.create",
        action: "CREATE",
        name: "Create Reports",
        description: "Allows creating reports",
      },
      {
        code: "reports.update",
        action: "UPDATE",
        name: "Update Reports",
        description: "Allows updating reports",
      },
      {
        code: "reports.delete",
        action: "DELETE",
        name: "Delete Reports",
        description: "Allows deleting reports",
      },
      {
        code: "reports.execute",
        action: "EXECUTE",
        name: "Run Reports",
        description: "Allows executing reports",
      },
      {
        code: "reports.print",
        action: "PRINT",
        name: "Print Reports",
        description: "Allows printing reports",
      },
      {
        code: "reports.export",
        action: "EXPORT",
        name: "Export Reports",
        description: "Allows exporting reports",
      },
    ],
  },

  // ===========================================================================
  // ANALYTICS
  // ===========================================================================

  {
    code: "ANALYTICS",
    name: "Analytics",
    description: "Business analytics",

    permissions: [
      {
        code: "analytics.view",
        action: "VIEW",
        name: "View Analytics",
        description: "Allows viewing analytics",
      },
      {
        code: "analytics.export",
        action: "EXPORT",
        name: "Export Analytics",
        description: "Allows exporting analytics",
      },
    ],
  },

  // ===========================================================================
  // FORECASTS
  // ===========================================================================

  {
    code: "FORECASTS",
    name: "Forecasts",
    description: "Business forecasting",

    permissions: [
      {
        code: "forecasts.view",
        action: "VIEW",
        name: "View Forecasts",
        description: "Allows viewing forecasts",
      },
      {
        code: "forecasts.create",
        action: "CREATE",
        name: "Create Forecasts",
        description: "Allows creating forecasts",
      },
      {
        code: "forecasts.execute",
        action: "EXECUTE",
        name: "Run Forecasts",
        description: "Allows running forecasts",
      },
      {
        code: "forecasts.export",
        action: "EXPORT",
        name: "Export Forecasts",
        description: "Allows exporting forecasts",
      },
    ],
  },

  // ===========================================================================
  // KPIs
  // ===========================================================================

  {
    code: "KPIS",
    name: "KPIs",
    description: "Key performance indicators",

    permissions: [
      {
        code: "kpis.view",
        action: "VIEW",
        name: "View KPIs",
        description: "Allows viewing KPIs",
      },
      {
        code: "kpis.create",
        action: "CREATE",
        name: "Create KPIs",
        description: "Allows creating KPIs",
      },
      {
        code: "kpis.update",
        action: "UPDATE",
        name: "Update KPIs",
        description: "Allows updating KPIs",
      },
      {
        code: "kpis.delete",
        action: "DELETE",
        name: "Delete KPIs",
        description: "Allows deleting KPIs",
      },
      {
        code: "kpis.export",
        action: "EXPORT",
        name: "Export KPIs",
        description: "Allows exporting KPIs",
      },
    ],
  },

  // ===========================================================================
  // METRICS
  // ===========================================================================

  {
    code: "METRICS",
    name: "Metrics",
    description: "Business metrics",

    permissions: [
      {
        code: "metrics.view",
        action: "VIEW",
        name: "View Metrics",
        description: "Allows viewing metrics",
      },
      {
        code: "metrics.create",
        action: "CREATE",
        name: "Create Metrics",
        description: "Allows creating metrics",
      },
      {
        code: "metrics.update",
        action: "UPDATE",
        name: "Update Metrics",
        description: "Allows updating metrics",
      },
      {
        code: "metrics.delete",
        action: "DELETE",
        name: "Delete Metrics",
        description: "Allows deleting metrics",
      },
      {
        code: "metrics.export",
        action: "EXPORT",
        name: "Export Metrics",
        description: "Allows exporting metrics",
      },
    ],
  },

  // ===========================================================================
  // NUMBERING SEQUENCES
  // ===========================================================================

  {
    code: "NUMBERING_SEQUENCES",
    name: "Numbering Sequences",
    description: "Document numbering configuration",

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
        action: "EXECUTE",
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

  // ===========================================================================
  // AUDIT
  // ===========================================================================

  {
    code: "AUDIT",
    name: "Audit",
    description: "System audit and activity history",

    permissions: [
      {
        code: "audit.view",
        action: "VIEW",
        name: "View Audit Logs",
        description: "Allows viewing audit logs",
      },
      {
        code: "audit.export",
        action: "EXPORT",
        name: "Export Audit Logs",
        description: "Allows exporting audit logs",
      },
    ],
  },

  // ===========================================================================
  // NOTIFICATIONS
  // ===========================================================================

  {
    code: "NOTIFICATIONS",
    name: "Notifications",
    description: "Business notifications",

    permissions: [
      {
        code: "notifications.view",
        action: "VIEW",
        name: "View Notifications",
        description: "Allows viewing notifications",
      },
      {
        code: "notifications.create",
        action: "CREATE",
        name: "Create Notifications",
        description: "Allows creating notifications",
      },
      {
        code: "notifications.manage",
        action: "MANAGE",
        name: "Manage Notifications",
        description: "Allows managing notification configuration",
      },
    ],
  },

  // ===========================================================================
  // INTEGRATIONS
  // ===========================================================================

  {
    code: "INTEGRATIONS",
    name: "Integrations",
    description: "External system integrations",

    permissions: [
      {
        code: "integrations.view",
        action: "VIEW",
        name: "View Integrations",
        description: "Allows viewing integrations",
      },
      {
        code: "integrations.create",
        action: "CREATE",
        name: "Create Integrations",
        description: "Allows configuring integrations",
      },
      {
        code: "integrations.update",
        action: "UPDATE",
        name: "Update Integrations",
        description: "Allows updating integrations",
      },
      {
        code: "integrations.delete",
        action: "DELETE",
        name: "Delete Integrations",
        description: "Allows removing integrations",
      },
      {
        code: "integrations.enable",
        action: "ENABLE",
        name: "Enable Integrations",
        description: "Allows enabling integrations",
      },
      {
        code: "integrations.disable",
        action: "DISABLE",
        name: "Disable Integrations",
        description: "Allows disabling integrations",
      },
      {
        code: "integrations.sync",
        action: "SYNC",
        name: "Synchronize Integrations",
        description: "Allows synchronizing integrations",
      },
    ],
  },

];

export type CanonicalPermissionCode =
  (typeof PERMISSION_REGISTRY)[number]["permissions"][number]["code"];

export default PERMISSION_REGISTRY;
