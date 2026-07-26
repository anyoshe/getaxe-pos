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


export const units = pgTable(
  "units",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global unit
    // UUID = Business-specific unit
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    symbol: text("symbol"),

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
    businessIdx: index("units_business_idx")
      .on(table.businessId),

    activeIdx: index("units_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "units_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "units_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),

    uniqueSymbol: uniqueIndex(
      "units_business_symbol_unique"
    ).on(
      table.businessId,
      table.symbol
    ),
  })
);

export const unitsRelations = relations(
  units,
  ({ one }) => ({
    business: one(businesses, {
      fields: [units.businessId],
      references: [businesses.id],
    }),
  })
);