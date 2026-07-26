
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
import { products } from "../inventory/products";

export const dosageForms = pgTable(
  "dosage_forms",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global dosage form
    // UUID = Business-specific dosage form
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),
    
    standardCode: text("standard_code"),
    
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
    businessIdx: index("dosage_forms_business_idx")
      .on(table.businessId),

    activeIdx: index("dosage_forms_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "dosage_forms_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "dosage_forms_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);

export const dosageFormsRelations = relations(
  dosageForms,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [dosageForms.businessId],
      references: [businesses.id],
    }),

    products: many(products),
  })
);