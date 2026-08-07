import {
  PURCHASE_ORDER_CAPABILITIES,
} from "./purchasing/01-purchase-orders";

import {
  SUPPLIER_CAPABILITIES,
} from "./purchasing/02-supplier-management";

import {
  GOODS_RECEIVING_CAPABILITIES,
} from "./purchasing/03-goods-receiving";

import {
  PURCHASE_RETURN_CAPABILITIES,
} from "./purchasing/04-purchase-returns";

import {
  ADVANCED_PURCHASING_CAPABILITIES,
} from "./purchasing/05-advanced-purchasing";


export const PURCHASING_CAPABILITIES = [
  ...PURCHASE_ORDER_CAPABILITIES,
  ...SUPPLIER_CAPABILITIES,
  ...GOODS_RECEIVING_CAPABILITIES,
  ...PURCHASE_RETURN_CAPABILITIES,
  ...ADVANCED_PURCHASING_CAPABILITIES,
];