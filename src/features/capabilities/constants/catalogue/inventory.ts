import {
  PRODUCT_MASTER_CAPABILITIES,
} from "./inventory/01-product-master";

import {
  IDENTIFICATION_CAPABILITIES,
} from "./inventory/02-identification";

import {
  MEASUREMENT_CAPABILITIES,
} from "./inventory/03-measurements";

import {
  STOCK_CONTROL_CAPABILITIES,
} from "./inventory/04-stock-control";

import {
  WAREHOUSING_CAPABILITIES,
} from "./inventory/05-warehousing";

import {
  PRICING_CAPABILITIES,
} from "./inventory/06-pricing";


import {
  QUALITY_CAPABILITIES,
} from "./inventory/08-quality";

import {
  COMPLIANCE_CAPABILITIES,
} from "./inventory/09-compliance";

import {
  INVENTORY_ANALYTICS_CAPABILITIES,
} from "./inventory/10-analytics";


export const INVENTORY_CAPABILITIES = [
  ...PRODUCT_MASTER_CAPABILITIES,
  ...IDENTIFICATION_CAPABILITIES,
  ...MEASUREMENT_CAPABILITIES,
  ...STOCK_CONTROL_CAPABILITIES,
  ...WAREHOUSING_CAPABILITIES,
  ...PRICING_CAPABILITIES,
  ...QUALITY_CAPABILITIES,
  ...COMPLIANCE_CAPABILITIES,
  ...INVENTORY_ANALYTICS_CAPABILITIES,
];