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
import { users } from "../users/users";
import { purchaseOrderStatusEnum } from "../shared";

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),

    orderNumber: text("order_number")
      .notNull(),

    status: purchaseOrderStatusEnum("status")
      .default("DRAFT")
      .notNull(),

    subtotal: numeric("subtotal", {
      precision: 12,
      scale: 2,
    }).default("0"),

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
    }).default("0"),

    notes: text("notes"),

    orderedBy: uuid("ordered_by")
      .references(() => users.id),

    approvedBy: uuid("approved_by")
      .references(() => users.id),

    orderedAt: timestamp("ordered_at")
      .defaultNow()
      .notNull(),

    approvedAt: timestamp("approved_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("po_business_idx").on(table.businessId),

    supplierIdx: index("po_supplier_idx").on(table.supplierId),

    orderIdx: index("po_order_idx").on(table.orderNumber),

    statusIdx: index("po_status_idx").on(table.status),
  })
);