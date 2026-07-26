import {
  pgTable,
  uuid,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { goodsReceiptItems } from "./goods_receipt_items";
import { purchaseOrders } from "./purchase_orders";
import { products } from "../inventory/products";

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    purchaseOrderId: uuid("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    quantity: integer("quantity")
      .notNull(),

    receivedQuantity: integer("received_quantity")
      .default(0)
      .notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),

    discount: numeric("discount", {
      precision: 12,
      scale: 2,
    }).default("0"),

    tax: numeric("tax", {
      precision: 12,
      scale: 2,
    }).default("0"),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    orderIdx: index("poi_order_idx").on(table.purchaseOrderId),

    productIdx: index("poi_product_idx").on(table.productId),
  })
);

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one, many }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),

    product: one(products, {
      fields: [purchaseOrderItems.productId],
      references: [products.id],
    }),

    goodsReceiptItems: many(goodsReceiptItems),
  })
);