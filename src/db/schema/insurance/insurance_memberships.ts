import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { customers } from "../sales/customers";
import { insurancePlans } from "./insurance_plans";
import { insuranceClaims } from "./insurance_claims";

export const insuranceMemberships = pgTable(
  "insurance_memberships",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, {
        onDelete: "cascade",
      }),

    insurancePlanId: uuid("insurance_plan_id")
      .notNull()
      .references(() => insurancePlans.id),

    membershipNumber: text("membership_number")
      .notNull(),

    principalMemberName: text("principal_member_name"),

    relationshipToPrincipal: text("relationship_to_principal"),

    active: boolean("active")
      .default(true)
      .notNull(),

    effectiveFrom: timestamp("effective_from"),

    effectiveTo: timestamp("effective_to"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    customerIdx: index(
      "insurance_memberships_customer_idx"
    ).on(table.customerId),

    planIdx: index(
      "insurance_memberships_plan_idx"
    ).on(table.insurancePlanId),

    activeIdx: index(
      "insurance_memberships_active_idx"
    ).on(table.active),

    membershipNumberIdx: uniqueIndex(
      "insurance_memberships_number_unique"
    ).on(table.membershipNumber),
  })
);

export const insuranceMembershipsRelations = relations(
  insuranceMemberships,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [insuranceMemberships.customerId],
      references: [customers.id],
    }),

    insurancePlan: one(insurancePlans, {
      fields: [insuranceMemberships.insurancePlanId],
      references: [insurancePlans.id],
    }),

    claims: many(insuranceClaims),
  })
);