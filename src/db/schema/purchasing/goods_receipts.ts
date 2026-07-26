import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { suppliers } from "../inventory/suppliers";
import { purchaseOrders } from "./purchase_orders";
import { users } from "../users/users";
import { goodsReceiptStatusEnum } from "../shared";

import { relations } from "drizzle-orm";

import { goodsReceiptItems } from "./goods_receipt_items";

export const goodsReceipts = pgTable(
  "goods_receipts",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    purchaseOrderId: uuid("purchase_order_id")
      .references(() => purchaseOrders.id),

    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),

    receiptNumber: text("receipt_number")
      .notNull(),

    supplierInvoiceNumber: text("supplier_invoice_number"),

    status: goodsReceiptStatusEnum("status")
      .default("DRAFT")
      .notNull(),

    subtotal: numeric("subtotal", {
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
    }).default("0"),

    receivedBy: uuid("received_by")
      .references(() => users.id),

    notes: text("notes"),

    receivedAt: timestamp("received_at")
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("grn_business_idx").on(table.businessId),

    supplierIdx: index("grn_supplier_idx").on(table.supplierId),

    purchaseOrderIdx: index("grn_po_idx").on(table.purchaseOrderId),

    receiptNumberIdx: index("grn_number_idx").on(table.receiptNumber),
  })
);

export const goodsReceiptsRelations = relations(
  goodsReceipts,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [goodsReceipts.businessId],
      references: [businesses.id],
    }),

    purchaseOrder: one(purchaseOrders, {
      fields: [goodsReceipts.purchaseOrderId],
      references: [purchaseOrders.id],
    }),

    supplier: one(suppliers, {
      fields: [goodsReceipts.supplierId],
      references: [suppliers.id],
    }),

    receivedByUser: one(users, {
      fields: [goodsReceipts.receivedBy],
      references: [users.id],
    }),

    items: many(goodsReceiptItems),
  })
);