import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { customers } from "./customers";
import { users } from "../users/users";
import { saleStatusEnum } from "../shared";
import { relations } from "drizzle-orm";
import { branches } from "../settings/branches";
import { warehouses } from "../settings/warehouses";
import { saleItems } from "./sale_items";
import { payments } from "./payments";

export const sales = pgTable(
  "sales",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    customerId: uuid("customer_id")
      .references(() => customers.id, {
        onDelete: "set null",
      }),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id),

    invoiceNumber: text("invoice_number")
      .notNull(),

    status: saleStatusEnum("status")
      .default("COMPLETED")
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

    soldBy: uuid("sold_by")
      .notNull()
      .references(() => users.id),

    soldAt: timestamp("sold_at")
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
    businessIdx: index(
      "sales_business_idx"
    ).on(table.businessId),

    customerIdx: index(
      "sales_customer_idx"
    ).on(table.customerId),

    branchIdx: index("sales_branch_idx")
      .on(table.branchId),

    warehouseIdx: index("sales_warehouse_idx")
      .on(table.warehouseId),

    invoiceUnique: uniqueIndex(
      "sales_business_invoice_unique"
    ).on(
      table.businessId,
      table.invoiceNumber
    ),

    soldByIdx: index(
      "sales_sold_by_idx"
    ).on(table.soldBy),

    statusIdx: index(
      "sales_status_idx"
    ).on(table.status),

    soldAtIdx: index(
      "sales_sold_at_idx"
    ).on(table.soldAt),

    createdAtIdx: index(
      "sales_created_at_idx"
    ).on(table.createdAt),
  })
);

export const salesRelations = relations(
  sales,
  ({ one, many })=> ({
    business: one(businesses, {
      fields: [sales.businessId],
      references: [businesses.id],
    }),

    customer: one(customers, {
      fields: [sales.customerId],
      references: [customers.id],
    }),

    branch: one(branches, {
      fields: [sales.branchId],
      references: [branches.id],
    }),

    warehouse: one(warehouses, {
      fields: [sales.warehouseId],
      references: [warehouses.id],
    }),

    soldBy: one(users, {
      fields: [sales.soldBy],
      references: [users.id],
    }),


    items: many(saleItems),
    payments: many(payments),
  })
);