import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { users } from "../users/users";
import { warehouses } from "../settings/warehouses";
import { products } from "../inventory/products";
import { productBatches } from "../inventory/product_batches";

/** Walk-in / OTC-friendly dispensing (prescription optional as text ref). */
export const walkInDispensings = pgTable(
  "dispensings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    customerId: uuid("customer_id"),
    patientName: text("patient_name"),
    prescriptionRef: text("prescription_ref"),
    status: text("status").notNull().default("DRAFT"),
    notes: text("notes"),
    dispensedBy: uuid("dispensed_by").references(() => users.id),
    dispensedAt: timestamp("dispensed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    businessIdx: index("dispensings_business_idx").on(t.businessId),
    statusIdx: index("dispensings_status_idx").on(t.status),
  }),
);

export const walkInDispensingItems = pgTable(
  "dispensing_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    dispensingId: uuid("dispensing_id")
      .notNull()
      .references(() => walkInDispensings.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    batchId: uuid("batch_id").references(() => productBatches.id),
    quantity: numeric("quantity", { precision: 18, scale: 4 }).notNull(),
    dosageInstructions: text("dosage_instructions"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    dispensingIdx: index("dispensing_items_dispensing_idx").on(t.dispensingId),
    productIdx: index("dispensing_items_product_idx").on(t.productId),
  }),
);

export const walkInDispensingsRelations = relations(
  walkInDispensings,
  ({ many }) => ({
    items: many(walkInDispensingItems),
  }),
);

export const walkInDispensingItemsRelations = relations(
  walkInDispensingItems,
  ({ one }) => ({
    dispensing: one(walkInDispensings, {
      fields: [walkInDispensingItems.dispensingId],
      references: [walkInDispensings.id],
    }),
  }),
);
