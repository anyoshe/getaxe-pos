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

export const insuranceProviders = pgTable(
  "insurance_providers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    // NULL = Global provider
    // UUID = Business-specific provider
    businessId: uuid("business_id")
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    contactPerson: text("contact_person"),

    phone: text("phone"),

    email: text("email"),

    address: text("address"),

    website: text("website"),

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
    businessIdx: index(
      "insurance_providers_business_idx"
    ).on(table.businessId),

    activeIdx: index(
      "insurance_providers_active_idx"
    ).on(table.active),

    uniqueCode: uniqueIndex(
      "insurance_providers_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "insurance_providers_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);