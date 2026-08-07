import {
  SALES_CORE_CAPABILITIES,
} from "./sales/01-sales-core";

import {
  CUSTOMER_CAPABILITIES,
} from "./sales/02-customers";

import {
  PAYMENT_CAPABILITIES,
} from "./sales/03-payments";

import {
  SALES_RETURN_CAPABILITIES,
} from "./sales/04-returns";

import {
  DISCOUNT_CAPABILITIES,
} from "./sales/05-discounts";

import {
  ADVANCED_SALES_CAPABILITIES,
} from "./sales/06-advanced-sales";


export const SALES_CAPABILITIES = [
  ...SALES_CORE_CAPABILITIES,
  ...CUSTOMER_CAPABILITIES,
  ...PAYMENT_CAPABILITIES,
  ...SALES_RETURN_CAPABILITIES,
  ...DISCOUNT_CAPABILITIES,
  ...ADVANCED_SALES_CAPABILITIES,
];