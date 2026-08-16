import type {
  CapabilityDefinition,
} from "../../../types";

export const PRODUCT_MASTER_CAPABILITIES: CapabilityDefinition[] = [

  {
    id: "inventory.product-types",

    code: "PRODUCT_TYPES",

    name: "Product Types",

    description:
      "Support multiple product types including stock items, services, non-stock items, assets, kits and manufactured products.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

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
      "product.update",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.product-types",
    ],
  },

  {
    id: "inventory.product-variants",

    code: "PRODUCT_VARIANTS",

    name: "Product Variants",

    description:
      "Support multiple variants of the same product such as size, colour and model.",

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
      "product.update",
    ],

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.product-variants",
    ],
  },

  {
    id: "inventory.product-attributes",

    code: "PRODUCT_ATTRIBUTES",

    name: "Product Attributes",

    description:
      "Allow configurable product attributes such as colour, size, flavour, material and specification.",

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

    validators: [],

    permissions: [
      "products.update",
    ],

    featureFlags: [
      "inventory.product-attributes",
    ],
  },

  {
    id: "inventory.brands",

    code: "PRODUCT_BRANDS",

    name: "Brands",

    description:
      "Manage product brands.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
      "brands",
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
      "products.update",
    ],

    featureFlags: [
      "inventory.brands",
    ],
  },

  {
    id: "inventory.manufacturers",

    code: "PRODUCT_MANUFACTURERS",

    name: "Manufacturers",

    description:
      "Manage product manufacturers.",

    module: "INVENTORY",

    group: "INVENTORY",

    category: "PRODUCT",

    status: "ACTIVE",

    industries: [],

    defaultEnabled: true,

    dependencies: [],

    conflicts: [],

    schema: [
      "products",
      "manufacturers",
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
      "products.update",
    ],

    featureFlags: [
      "inventory.manufacturers",
    ],
  },

];