
import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { customers } from "../sales/customers";
import { prescriptionStatusEnum } from "../shared";
import { consultations } from "../clinical/consultations";
import { relations } from "drizzle-orm";

import { prescriptionItems } from "./prescription_items";

export const prescriptions = pgTable(
  "prescriptions",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    
    consultationId: uuid("consultation_id")
    .references(() => consultations.id),

    prescriptionNumber: text("prescription_number")
      .notNull(),

    doctorName: text("doctor_name")
      .notNull(),

    doctorLicense: text("doctor_license"),

    hospitalName: text("hospital_name"),

    prescriptionDate: date("prescription_date")
      .notNull(),

    expiryDate: date("expiry_date"),

    status: prescriptionStatusEnum("status")
      .default("PENDING")
      .notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("prescriptions_business_idx")
      .on(table.businessId),

    customerIdx: index("prescriptions_customer_idx")
      .on(table.customerId),

    statusIdx: index("prescriptions_status_idx")
      .on(table.status),

    prescriptionNumberIdx: uniqueIndex(
      "prescriptions_business_number_unique"
    ).on(
      table.businessId,
      table.prescriptionNumber
    ),
  })
);
export const prescriptionsRelations = relations(
  prescriptions,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [prescriptions.businessId],
      references: [businesses.id],
    }),

    customer: one(customers, {
      fields: [prescriptions.customerId],
      references: [customers.id],
    }),

    consultation: one(consultations, {
      fields: [prescriptions.consultationId],
      references: [consultations.id],
    }),

    items: many(prescriptionItems),
  })
);