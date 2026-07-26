import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { relations } from "drizzle-orm";

import { consultationDiagnoses } from "./consultation_diagnoses";

export const diagnoses = pgTable(
  "diagnoses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global diagnosis
    // UUID = Business-specific diagnosis
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    description: text("description"),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("diagnoses_business_idx")
      .on(table.businessId),

    activeIdx: index("diagnoses_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "diagnoses_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "diagnoses_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);
export const diagnosesRelations = relations(
  diagnoses,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [diagnoses.businessId],
      references: [businesses.id],
    }),

    consultationDiagnoses: many(consultationDiagnoses),
  })
);