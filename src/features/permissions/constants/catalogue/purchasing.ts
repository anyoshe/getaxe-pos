import type { PermissionModule } from "../../types";

export const PURCHASING_PERMISSION_MODULES: PermissionModule[] = [
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
        description: "Allows updating purchase orders",
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
        description: "Allows sending purchase orders",
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
    description: "Goods receipt management",
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
        description: "Allows creating goods receipts",
      },
      {
        code: "goods_receipts.post",
        action: "POST",
        name: "Post Goods Receipts",
        description: "Allows posting goods receipts",
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
