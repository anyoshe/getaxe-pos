import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { branches } from "./branches";
import { documentTypeEnum } from "../shared";
import { relations } from "drizzle-orm";


export const numberingSequences = pgTable(
  "numbering_sequences",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    branchId: uuid("branch_id")
      .references(() => branches.id, {
        onDelete: "set null",
      }),

    documentType: documentTypeEnum("document_type")
      .notNull(),

    prefix: text("prefix")
      .notNull(),

    suffix: text("suffix"),

    nextNumber: integer("next_number")
      .default(1)
      .notNull(),

    numberLength: integer("number_length")
      .default(6)
      .notNull(),

    separator: text("separator")
      .default("-")
      .notNull(),

    resetPeriod: text("reset_period")
      .default("NEVER")
      .notNull(),

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
    businessIdx: index("numbering_sequences_business_idx")
      .on(table.businessId),

    branchIdx: index("numbering_sequences_branch_idx")
      .on(table.branchId),

    documentTypeIdx: index("numbering_sequences_document_type_idx")
      .on(table.documentType),

    activeIdx: index("numbering_sequences_active_idx")
      .on(table.active),

    uniqueSequence: uniqueIndex(
      "numbering_sequences_business_branch_document_unique"
    ).on(
      table.businessId,
      table.branchId,
      table.documentType
    ),
  })
);

export const numberingSequencesRelations = relations(
  numberingSequences,
  ({ one }) => ({
    business: one(businesses, {
      fields: [numberingSequences.businessId],
      references: [businesses.id],
    }),

    branch: one(branches, {
      fields: [numberingSequences.branchId],
      references: [branches.id],
    }),
  })
);