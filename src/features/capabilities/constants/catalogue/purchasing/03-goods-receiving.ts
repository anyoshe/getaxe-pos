import type {
  CapabilityDefinition,
} from "../../../types";


export const GOODS_RECEIVING_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "purchasing.goods-receiving",

    code: "GOODS_RECEIVING",

    name: "Goods Receiving",

    description:
      "Receive purchased products into inventory.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "purchasing.purchase-orders",
    ],

    conflicts: [],

    schema: [
      "goods_receipts",
      "goods_receipt_items",
      "inventory_balances",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "goods-receipts",
      "inventory-receiving",
    ],

    workflows: [
      "purchase.receive",
      "stock.increase",
    ],

    validators: [
      "received-quantity-required",
    ],

    permissions: [
      "goods_receipts.create",
    ],

    featureFlags: [
      "purchasing.goods-receiving",
    ],
  },


  {
    id: "purchasing.batch-receiving",

    code: "PURCHASE_BATCH_RECEIVING",

    name: "Batch Capture During Receiving",

    description:
      "Capture product batches when receiving stock.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "FOOD",
      "AGROVET",
      "LABORATORY",
    ],

    defaultEnabled: false,

    dependencies: [
      "purchasing.goods-receiving",
      "inventory.batch-control",
    ],

    conflicts: [],

    schema: [
      "product_batches",
      "goods_receipt_items",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "goods-receipts",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [
      "batch-required",
    ],

    permissions: [
      "product_batches.update",
    ],

    featureFlags: [
      "purchasing.batch-receiving",
    ],
  },


  {
    id: "purchasing.expiry-receiving",

    code: "PURCHASE_EXPIRY_RECEIVING",

    name: "Expiry Date Capture",

    description:
      "Capture expiry dates during stock receiving.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "PHARMACY",
      "CHEMIST",
      "FOOD",
      "AGROVET",
    ],

    defaultEnabled: false,

    dependencies: [
      "purchasing.batch-receiving",
      "inventory.expiry-control",
    ],

    conflicts: [],

    schema: [
      "product_batches",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "goods-receipts",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [
      "expiry-required",
    ],

    permissions: [
      "product_batches.update",
    ],

    featureFlags: [
      "purchasing.expiry-receiving",
    ],
  },


  {
    id: "purchasing.serial-receiving",

    code: "PURCHASE_SERIAL_RECEIVING",

    name: "Serial Number Capture",

    description:
      "Capture serial numbers when receiving serialized products.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "HARDWARE",
      "ELECTRONICS",
      "SPARE_PARTS",
    ],

    defaultEnabled: false,

    dependencies: [
      "purchasing.goods-receiving",
      "inventory.serial-numbers",
    ],

    conflicts: [],

    schema: [
      "products",
      "goods_receipt_items",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "goods-receipts",
    ],

    workflows: [
      "purchase.receive",
    ],

    validators: [
      "serial-required",
    ],

    permissions: [
      "product_batches.update",
    ],

    featureFlags: [
      "purchasing.serial-receiving",
    ],
  },


  {
    id: "purchasing.receiving-quality-check",

    code: "RECEIVING_QUALITY_CHECK",

    name: "Receiving Quality Check",

    description:
      "Inspect received products before adding to available stock.",

    module: "PURCHASING",

    group: "PURCHASING",

    category: "PURCHASE",

    status: "ACTIVE",

    industries: [
      "MANUFACTURING",
      "LABORATORY",
      "FOOD",
    ],

    defaultEnabled: false,

    dependencies: [
      "purchasing.goods-receiving",
    ],

    conflicts: [],

    schema: [
      "goods_receipts",
    ],

    services: [
      "purchasing",
      "inventory",
    ],

    ui: [
      "receiving-quality",
    ],

    workflows: [
      "purchase.inspect",
      "purchase.accept",
    ],

    validators: [
      "quality-check-required",
    ],

    permissions: [
      "goods_receipts.post",
    ],

    featureFlags: [
      "purchasing.receiving-quality-check",
    ],
  },


];