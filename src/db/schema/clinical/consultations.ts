import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { branches } from "../settings/branches";
import { customers } from "../sales/customers";
import { users } from "../users/users";
import { consultationStatusEnum } from "../shared";
import { relations } from "drizzle-orm";

import { consultationDiagnoses } from "./consultation_diagnoses";
import { prescriptions } from "../pharmacy/prescriptions";

export const consultations = pgTable(
  "consultations",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),

    consultationNumber: text("consultation_number")
      .notNull(),

    clinicianId: uuid("clinician_id")
      .notNull()
      .references(() => users.id),

    visitReason: text("visit_reason"),

    historyOfPresentIllness: text("history_of_present_illness"),

    examinationNotes: text("examination_notes"),

    clinicalNotes: text("clinical_notes"),

    status: consultationStatusEnum("status")
      .default("OPEN")
      .notNull(),

    consultationDate: timestamp("consultation_date")
      .defaultNow()
      .notNull(),

    completedAt: timestamp("completed_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("consultations_business_idx")
      .on(table.businessId),

    branchIdx: index("consultations_branch_idx")
      .on(table.branchId),

    customerIdx: index("consultations_customer_idx")
      .on(table.customerId),

    clinicianIdx: index("consultations_clinician_idx")
      .on(table.clinicianId),

    statusIdx: index("consultations_status_idx")
      .on(table.status),

    consultationNumberIdx: uniqueIndex(
      "consultations_business_number_unique"
    ).on(
      table.businessId,
      table.consultationNumber
    ),
  })
);
export const consultationsRelations = relations(
  consultations,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [consultations.businessId],
      references: [businesses.id],
    }),

    branch: one(branches, {
      fields: [consultations.branchId],
      references: [branches.id],
    }),

    customer: one(customers, {
      fields: [consultations.customerId],
      references: [customers.id],
    }),

    clinician: one(users, {
      fields: [consultations.clinicianId],
      references: [users.id],
    }),

    diagnoses: many(consultationDiagnoses),

    prescriptions: many(prescriptions),
  })
);