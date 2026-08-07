import type {
  CapabilityDefinition,
} from "../../../types";

export const IDENTIFICATION_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.sku",

    code: "SKU",

    name: "Stock Keeping Unit",

    description:
      "Support manual product SKU identification.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.product-types",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
      "product-dialog",
    ],

    workflows: [
      "product.create",
    ],

    validators: [
      "sku-unique",
    ],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.sku",
    ],
  },

  {
    id: "inventory.auto-sku",

    code: "AUTO_SKU",

    name: "Automatic SKU Generation",

    description:
      "Automatically generate product SKUs.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.sku",
    ],

    conflicts: [],

    schema: [
      "products",
      "numbering_sequences",
    ],

    services: [
      "inventory",
      "settings",
    ],

    ui: [
      "products",
      "business-settings",
    ],

    workflows: [
      "product.create",
    ],

    validators: [],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.auto-sku",
    ],
  },

  {
    id: "inventory.barcode",

    code: "BARCODE",

    name: "Barcode",

    description:
      "Support barcode identification.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [
      "inventory.sku",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "products",
      "sales",
    ],

    workflows: [
      "product.create",
      "sale.complete",
    ],

    validators: [
      "barcode-unique",
    ],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.barcode",
    ],
  },

  {
    id: "inventory.multiple-barcodes",

    code: "MULTIPLE_BARCODES",

    name: "Multiple Barcodes",

    description:
      "Allow multiple barcodes per product.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.barcode",
    ],

    conflicts: [],

    schema: [
      "products",
      "product_barcodes",
    ],

    services: [
      "inventory",
      "sales",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "product.create",
    ],

    validators: [],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.multiple-barcodes",
    ],
  },

  {
    id: "inventory.qr-code",

    code: "QR_CODE",

    name: "QR Code",

    description:
      "Support QR code identification.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: false,

    dependencies: [
      "inventory.barcode",
    ],

    conflicts: [],

    schema: [
      "products",
    ],

    services: [
      "inventory",
    ],

    ui: [
      "products",
    ],

    workflows: [
      "product.create",
    ],

    validators: [],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.qr-code",
    ],
  },

  {
    id: "inventory.serial-numbers",

    code: "SERIAL_NUMBERS",

    name: "Serial Number Tracking",

    description:
      "Track every product using serial numbers.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "STOCK",

    status: "ACTIVE",

    industries: [
      "HARDWARE",
      "GARAGE",
      "ELECTRONICS",
      "SPARE_PARTS",
    ],

    defaultEnabled: false,

    dependencies: [],

    conflicts: [
      "inventory.batch-control",
    ],

    schema: [
      "products",
      "product_serials",
    ],

    services: [
      "inventory",
      "sales",
      "purchasing",
    ],

    ui: [
      "products",
      "sales",
    ],

    workflows: [
      "purchase.receive",
      "sale.complete",
    ],

    validators: [
      "serial-required",
    ],

    permissions: [
      "inventory.products.manage",
    ],

    featureFlags: [
      "inventory.serial",
    ],
  },

];