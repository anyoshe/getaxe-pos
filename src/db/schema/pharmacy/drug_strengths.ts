
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

export const drugStrengths = pgTable(
  "drug_strengths",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global strength
    // UUID = Business-specific strength
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
    businessIdx: index("drug_strengths_business_idx")
      .on(table.businessId),

    activeIdx: index("drug_strengths_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "drug_strengths_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "drug_strengths_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

