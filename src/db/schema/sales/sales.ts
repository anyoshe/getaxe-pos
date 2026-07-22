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