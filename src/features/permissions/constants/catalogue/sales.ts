import type { PermissionModule } from "../../types";

export const SALES_PERMISSION_MODULES: readonly PermissionModule[] = [
  {
    code: "SALES",
    name: "Sales",
    description: "Sales and point-of-sale operations",
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
        description: "Allows updating sales",
      },
      {
        code: "sales.delete",
        action: "DELETE",
        name: "Delete Sales",
        description: "Allows deleting sales",
      },
      {
        code: "sales.pos",
        action: "CREATE",
        name: "Use Point of Sale",
        description: "Allows processing sales through the point of sale",
      },
      {
        code: "sales.orders",
        action: "CREATE",
        name: "Manage Sales Orders",
        description: "Allows managing sales orders",
      },
      {
        code: "sales.receipts",
        action: "PRINT",
        name: "Print Sales Receipts",
        description: "Allows printing sales receipts",
      },
      {
        code: "sales.discount",
        action: "APPROVE",
        name: "Apply Sales Discounts",
        description: "Allows applying sales discounts",
      },
      {
        code: "sales.exchange",
        action: "UPDATE",
        name: "Process Sales Exchanges",
        description: "Allows processing sales exchanges",
      },
      {
        code: "sales.refund",
        action: "CANCEL",
        name: "Process Sales Refunds",
        description: "Allows processing sales refunds",
      },
      {
        code: "sales.quotation",
        action: "CREATE",
        name: "Manage Sales Quotations",
        description: "Allows creating and managing sales quotations",
      },
      {
        code: "sales.promotions",
        action: "UPDATE",
        name: "Manage Sales Promotions",
        description: "Allows managing sales promotions",
      },
      {
        code: "sales.coupons",
        action: "UPDATE",
        name: "Manage Sales Coupons",
        description: "Allows managing sales coupons",
      },
      {
        code: "sales.create",
        action: "CREATE",
        name: "Create Sale",
        description: "Allows creating an individual sale",
      },
      {
        code: "sales.complete",
        action: "POST",
        name: "Complete Sale",
        description: "Allows completing a sale",
      },
      {
        code: "stock.allocate",
        action: "UPDATE",
        name: "Allocate Sale Stock",
        description: "Allows allocating stock to a sale",
      },
      {
        code: "stock.release",
        action: "UPDATE",
        name: "Release Sale",
        description: "Allows releasing a sale",
      },
      {
        code: "sales.returns.create",
        action: "CREATE",
        name: "Process Sale Return",
        description: "Allows processing sale returns",
      },
      {
        code: "sales.returns.refund",
        action: "CANCEL",
        name: "Refund Sale",
        description: "Allows refunding a sale",
      },
      {
        code: "sales.returns.exchange",
        action: "UPDATE",
        name: "Exchange Sale",
        description: "Allows exchanging a sale",
      },
      {
        code: "sales.create",
        action: "CREATE",
        name: "Create Sale Credit",
        description: "Allows creating sales on credit",
      },
      {
        code: "sales.create",
        action: "CREATE",
        name: "Create Recurring Sale",
        description: "Allows creating recurring sales",
      },
      {
        code: "sales.update",
        action: "UPDATE",
        name: "Synchronize Sales",
        description: "Allows synchronizing sales",
      },
    ],
  },
  {
    code: "CUSTOMERS",
    name: "Customers",
    description: "Customer management",
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
        code: "customers.manage",
        action: "UPDATE",
        name: "Manage Customers",
        description: "Allows managing customers",
      },
      {
        code: "customers.create",
        action: "CREATE",
        name: "Create Customer",
        description: "Allows creating an individual customer",
      },
      {
        code: "loyalty.manage",
        action: "UPDATE",
        name: "Manage Customer Loyalty",
        description: "Allows managing customer loyalty",
      },
      {
        code: "loyalty.earn",
        action: "UPDATE",
        name: "Earn Loyalty",
        description: "Allows earning customer loyalty points",
      },
      {
        code: "loyalty.redeem",
        action: "UPDATE",
        name: "Redeem Loyalty",
        description: "Allows redeeming customer loyalty points",
      },
    ],
  },
  {
    code: "QUOTATIONS",
    name: "Quotations",
    description: "Quotation management",
    permissions: [
      {
        code: "quotations.create",
        action: "CREATE",
        name: "Create Quotations",
        description: "Allows creating quotations",
      },
      {
        code: "quotations.convert",
        action: "UPDATE",
        name: "Convert Quotations",
        description: "Allows converting quotations",
      },
    ],
  },
  {
    code: "SALES_ORDERS",
    name: "Orders",
    description: "Order management",
    permissions: [
      {
        code: "sales.orders.create",
        action: "CREATE",
        name: "Create Orders",
        description: "Allows creating orders",
      },
      {
        code: "sales.orders.approve",
        action: "UPDATE",
        name: "Confirm Orders",
        description: "Allows confirming orders",
      },
      {
        code: "sales.orders.complete",
        action: "POST",
        name: "Complete Orders",
        description: "Allows completing orders",
      },
    ],
  },
  {
    code: "DELIVERIES",
    name: "Delivery",
    description: "Sales delivery operations",
    permissions: [
      {
        code: "deliveries.create",
        action: "CREATE",
        name: "Create Deliveries",
        description: "Allows creating deliveries",
      },
      {
        code: "deliveries.complete",
        action: "POST",
        name: "Complete Deliveries",
        description: "Allows completing deliveries",
      },
    ],
  },
  {
    code: "DISCOUNTS",
    name: "Discounts",
    description: "Sales discount management",
    permissions: [
      {
        code: "discounts.create",
        action: "CREATE",
        name: "Request Discounts",
        description: "Allows requesting discounts",
      },
      {
        code: "discounts.approve",
        action: "APPROVE",
        name: "Approve Discounts",
        description: "Allows approving discounts",
      },
    ],
  },
  {
    code: "PROMOTIONS",
    name: "Promotions",
    description: "Sales promotion management",
    permissions: [
      {
        code: "promotions.apply",
        action: "UPDATE",
        name: "Apply Promotions",
        description: "Allows applying promotions",
      },
    ],
  },
];

export default SALES_PERMISSION_MODULES;
