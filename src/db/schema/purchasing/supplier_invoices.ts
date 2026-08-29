import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businesses } from "../core/businesses";
import { suppliers } from "../inventory/suppliers";
import { purchaseOrders } from "./purchase_orders";
import { users } from "../users/users";

export const supplierInvoices = pgTable(
  "supplier_invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id),
    purchaseOrderId: uuid("purchase_order_id").references(
      () => purchaseOrders.id,
    ),
    invoiceNumber: text("invoice_number").notNull(),
    invoiceDate: timestamp("invoice_date").defaultNow().notNull(),
    dueDate: timestamp("due_date"),
    status: text("status").notNull().default("OPEN"),
    subtotal: numeric("subtotal", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    tax: numeric("tax", { precision: 14, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
    amountPaid: numeric("amount_paid", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    balanceDue: numeric("balance_due", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    currency: text("currency").notNull().default("KES"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    businessIdx: index("supplier_invoices_business_idx").on(t.businessId),
    supplierIdx: index("supplier_invoices_supplier_idx").on(t.supplierId),
    numberUnique: uniqueIndex("supplier_invoices_business_number_unique").on(
      t.businessId,
      t.invoiceNumber,
    ),
  }),
);
