
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
import { dispensingLevelEnum } from "../shared";

export const prescriptionTypes = pgTable(
  "prescription_types",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global prescription type
    // UUID = Business-specific prescription type
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    description: text("description"),

    // requiresPrescription: boolean("requires_prescription")
    //   .default(false)
    //   .notNull(),

    // isControlledDrug: boolean("is_controlled_drug")
    //   .default(false)
    //   .notNull(),
    dispensingLevel: dispensingLevelEnum("dispensing_level")
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
    businessIdx: index("prescription_types_business_idx")
      .on(table.businessId),

    activeIdx: index("prescription_types_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "prescription_types_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "prescription_types_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

