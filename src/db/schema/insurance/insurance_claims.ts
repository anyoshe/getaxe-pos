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
import { customers } from "../sales/customers";
import { consultations } from "../clinical/consultations";
import { dispensations } from "../pharmacy/dispensations";
import { insuranceMemberships } from "./insurance_memberships";
import { insuranceClaimStatusEnum } from "../shared";
import { relations } from "drizzle-orm";

import { insuranceClaimItems } from "./insurance_claim_items";

export const insuranceClaims = pgTable(
  "insurance_claims",
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

    insuranceMembershipId: uuid("insurance_membership_id")
      .notNull()
      .references(() => insuranceMemberships.id),

    consultationId: uuid("consultation_id")
      .references(() => consultations.id),

    dispensationId: uuid("dispensation_id")
      .references(() => dispensations.id),

    claimNumber: text("claim_number")
      .notNull(),

    insurerReference: text("insurer_reference"),

    totalAmount: numeric("total_amount", {
      precision: 12,
      scale: 2,
    })
      .notNull(),

    approvedAmount: numeric("approved_amount", {
      precision: 12,
      scale: 2,
    })
      .default("0")
      .notNull(),

    patientResponsibility: numeric("patient_responsibility", {
      precision: 12,
      scale: 2,
    })
      .default("0")
      .notNull(),

    status: insuranceClaimStatusEnum("status")
      .default("DRAFT")
      .notNull(),

    submittedAt: timestamp("submitted_at"),

    processedAt: timestamp("processed_at"),

    paidAt: timestamp("paid_at"),

    rejectionReason: text("rejection_reason"),

    serviceDate: timestamp("service_date"),

    notes: text("notes"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("insurance_claims_business_idx")
      .on(table.businessId),

    customerIdx: index("insurance_claims_customer_idx")
      .on(table.customerId),

    membershipIdx: index("insurance_claims_membership_idx")
      .on(table.insuranceMembershipId),

    consultationIdx: index("insurance_claims_consultation_idx")
      .on(table.consultationId),

    dispensationIdx: index("insurance_claims_dispensation_idx")
      .on(table.dispensationId),

    statusIdx: index("insurance_claims_status_idx")
      .on(table.status),

    claimNumberIdx: uniqueIndex(
      "insurance_claims_business_number_unique"
    ).on(
      table.businessId,
      table.claimNumber
    ),
  })
);
export const insuranceClaimsRelations = relations(
  insuranceClaims,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [insuranceClaims.businessId],
      references: [businesses.id],
    }),

    customer: one(customers, {
      fields: [insuranceClaims.customerId],
      references: [customers.id],
    }),

    membership: one(insuranceMemberships, {
      fields: [insuranceClaims.insuranceMembershipId],
      references: [insuranceMemberships.id],
    }),

    consultation: one(consultations, {
      fields: [insuranceClaims.consultationId],
      references: [consultations.id],
    }),

    dispensation: one(dispensations, {
      fields: [insuranceClaims.dispensationId],
      references: [dispensations.id],
    }),

    items: many(insuranceClaimItems),
  })
);