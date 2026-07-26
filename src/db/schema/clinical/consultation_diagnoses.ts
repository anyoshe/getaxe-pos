import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { consultations } from "./consultations";
import { diagnoses } from "./diagnoses";
import { diagnosisTypeEnum } from "../shared";
import { relations } from "drizzle-orm";

export const consultationDiagnoses = pgTable(
  "consultation_diagnoses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    consultationId: uuid("consultation_id")
      .notNull()
      .references(() => consultations.id, {
        onDelete: "cascade",
      }),

    diagnosisId: uuid("diagnosis_id")
      .notNull()
      .references(() => diagnoses.id),

    diagnosisType: diagnosisTypeEnum("diagnosis_type")
      .default("PRIMARY")
      .notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    consultationIdx: index(
      "consultation_diagnoses_consultation_idx"
    ).on(table.consultationId),

    diagnosisIdx: index(
      "consultation_diagnoses_diagnosis_idx"
    ).on(table.diagnosisId),

    uniqueDiagnosis: uniqueIndex(
      "consultation_diagnoses_unique"
    ).on(
      table.consultationId,
      table.diagnosisId
    ),
  })
);
export const consultationDiagnosesRelations = relations(
  consultationDiagnoses,
  ({ one }) => ({
    consultation: one(consultations, {
      fields: [consultationDiagnoses.consultationId],
      references: [consultations.id],
    }),

    diagnosis: one(diagnoses, {
      fields: [consultationDiagnoses.diagnosisId],
      references: [diagnoses.id],
    }),
  })
);