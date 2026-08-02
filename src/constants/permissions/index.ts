import type {
  PermissionRegistry,
} from "@/services/security/permission.types";

export const PERMISSION_REGISTRY: PermissionRegistry = [

  {
    code: "DASHBOARD",

    name: "Dashboard",

    description:
      "Dashboard and analytics",

    permissions: [

      {
        code: "dashboard.view",

        action: "VIEW",

        name: "View Dashboard",

        description:
          "Allows viewing the dashboard",
      },

    ],

  },

  {
  code: "USERS",

  name: "Users",

  description:
    "User management and security",

  permissions: [

    {
      code: "users.view",

      action: "VIEW",

      name: "View Users",

      description:
        "Allows viewing users",
    },

    {
      code: "users.create",

      action: "CREATE",

      name: "Create Users",

      description:
        "Allows creating users",
    },

    {
      code: "users.update",

      action: "UPDATE",

      name: "Update Users",

      description:
        "Allows updating users",
    },

    {
      code: "users.delete",

      action: "DELETE",

      name: "Delete Users",

      description:
        "Allows deleting users",
    },

    {
      code: "users.activate",

      action: "ACTIVATE",

      name: "Activate Users",

      description:
        "Allows activating users",
    },

    {
      code: "users.deactivate",

      action: "DEACTIVATE",

      name: "Deactivate Users",

      description:
        "Allows deactivating users",
    },

    {
      code: "users.reset_password",

      action: "RESET_PASSWORD",

      name: "Reset User Password",

      description:
        "Allows resetting user passwords",
    },

    {
      code: "users.assign_role",

      action: "ASSIGN_ROLE",

      name: "Assign User Roles",

      description:
        "Allows assigning roles to users",
    },

    {
      code: "users.export",

      action: "EXPORT",

      name: "Export Users",

      description:
        "Allows exporting users",
    },

    {
      code: "users.impersonate",

      action: "IMPERSONATE",

      name: "Impersonate Users",

      description:
        "Allows logging in as another user",
    },

  ],

},

{
  code: "ROLES",

  name: "Roles",

  description:
    "Role management",

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
      action: "ASSIGN_PERMISSIONS",
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

  description:
    "Permission management",

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

{
  code: "BUSINESS",

  name: "Business",

  description:
    "Business management",

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

  description:
    "Business branch management",

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

  description:
    "Warehouse management",

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

  description:
    "Fiscal year management",

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

  description:
    "Document numbering sequences",

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
      action: "RESET",
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

  description:
    "Business configuration",

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
{
  code: "UNITS",

  name: "Units",

  description:
    "Measurement units",

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
      code: "units.export",
      action: "EXPORT",
      name: "Export Units",
      description: "Allows exporting units",
    },

  ],

},

{
  code: "CATEGORIES",

  name: "Categories",

  description:
    "Product categories",

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
      code: "categories.export",
      action: "EXPORT",
      name: "Export Categories",
      description: "Allows exporting categories",
    },

  ],

},

{
  code: "PRODUCTS",

  name: "Products",

  description:
    "Product catalogue management",

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
      action: "ADJUST_PRICE",
      name: "Adjust Product Prices",
      description: "Allows changing product prices",
    },

    {
      code: "products.adjust_cost",
      action: "ADJUST_COST",
      name: "Adjust Product Cost",
      description: "Allows changing product cost",
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

  ],

},

{
  code: "PRICE_LISTS",

  name: "Price Lists",

  description:
    "Customer and sales price lists",

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
      code: "price_lists.export",
      action: "EXPORT",
      name: "Export Price Lists",
      description: "Allows exporting price lists",
    },

  ],

},

{
  code: "PRODUCT_PRICES",

  name: "Product Prices",

  description:
    "Product pricing",

  permissions: [

    {
      code: "product_prices.view",
      action: "VIEW",
      name: "View Product Prices",
      description: "Allows viewing product prices",
    },

    {
      code: "product_prices.update",
      action: "UPDATE",
      name: "Update Product Prices",
      description: "Allows updating product prices",
    },

    {
      code: "product_prices.export",
      action: "EXPORT",
      name: "Export Product Prices",
      description: "Allows exporting product prices",
    },

  ],

},

{
  code: "PRODUCT_BATCHES",

  name: "Product Batches",

  description:
    "Batch and expiry management",

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
      code: "product_batches.export",
      action: "EXPORT",
      name: "Export Product Batches",
      description: "Allows exporting product batches",
    },

  ],

},

{
  code: "STOCK_MOVEMENTS",

  name: "Stock Movements",

  description:
    "Inventory movement history",

  permissions: [

    {
      code: "stock_movements.view",
      action: "VIEW",
      name: "View Stock Movements",
      description: "Allows viewing stock movements",
    },

    {
      code: "stock_movements.export",
      action: "EXPORT",
      name: "Export Stock Movements",
      description: "Allows exporting stock movements",
    },

  ],

},

{
  code: "STOCK_ADJUSTMENTS",

  name: "Stock Adjustments",

  description:
    "Inventory adjustments",

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
{
  code: "STOCK_TRANSFERS",

  name: "Stock Transfers",

  description:
    "Warehouse stock transfers",

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
      description: "Allows receiving transferred stock",
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

{
  code: "SUPPLIERS",

  name: "Suppliers",

  description:
    "Supplier management",

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

{
  code: "PURCHASE_ORDERS",

  name: "Purchase Orders",

  description:
    "Purchase order management",

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
      code: "purchase_orders.approve",
      action: "APPROVE",
      name: "Approve Purchase Orders",
      description: "Allows approving purchase orders",
    },

    {
      code: "purchase_orders.send",
      action: "SEND",
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
      code: "purchase_orders.export",
      action: "EXPORT",
      name: "Export Purchase Orders",
      description: "Allows exporting purchase orders",
    },

    {
      code: "purchase_orders.print",
      action: "PRINT",
      name: "Print Purchase Orders",
      description: "Allows printing purchase orders",
    },

  ],

},

{
  code: "GOODS_RECEIPTS",

  name: "Goods Receipts",

  description:
    "Goods receipt processing",

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
      name: "Receive Goods",
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
      code: "goods_receipts.export",
      action: "EXPORT",
      name: "Export Goods Receipts",
      description: "Allows exporting goods receipts",
    },

    {
      code: "goods_receipts.print",
      action: "PRINT",
      name: "Print Goods Receipts",
      description: "Allows printing goods receipts",
    },

  ],

},

{
  code: "SUPPLIER_RETURNS",

  name: "Supplier Returns",

  description:
    "Supplier return management",

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
      code: "supplier_returns.export",
      action: "EXPORT",
      name: "Export Supplier Returns",
      description: "Allows exporting supplier returns",
    },

    {
      code: "supplier_returns.print",
      action: "PRINT",
      name: "Print Supplier Returns",
      description: "Allows printing supplier returns",
    },

  ],

},

];

export * from "./system-role-permissions";