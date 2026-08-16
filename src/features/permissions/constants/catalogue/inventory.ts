import type {
  PermissionModule,
} from "../../types";

export const INVENTORY_PERMISSION_MODULES: PermissionModule[] = [
  {
    code: "UNITS",
    name: "Units",
    description: "Product unit management",
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
    description: "Product master data management",
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
        action: "ADJUST",
        name: "Adjust Product Prices",
        description: "Allows adjusting product prices",
      },
      {
        code: "products.adjust_cost",
        action: "ADJUST",
        name: "Adjust Product Costs",
        description: "Allows adjusting product costs",
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
    description: "Price list management",
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
    description: "Product pricing management",
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
    description: "Product batch management",
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
    description: "Stock movement visibility and reporting",
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
    description: "Stock adjustment management",
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
    description: "Stock transfer management",
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
];