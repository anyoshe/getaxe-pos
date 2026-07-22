import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businessTypeEnum } from "../shared";

export const businesses = pgTable(
  "businesses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    name: text("name")
      .notNull(),

    legalName: text("legal_name"),

    registrationNumber: text("registration_number"),

    kraPin: text("kra_pin"),

    businessType: businessTypeEnum("business_type")
      .notNull(),

    email: text("email"),

    phone: text("phone"),

    website: text("website"),

    country: text("country")
      .default("Kenya")
      .notNull(),

    county: text("county"),

    town: text("town"),

    address: text("address"),

    currency: text("currency")
      .default("KES")
      .notNull(),

    timezone: text("timezone")
      .default("Africa/Nairobi")
      .notNull(),

    logo: text("logo"),

    active: boolean("active")
      .default(true)
      .notNull(),

    createdBy: uuid("created_by"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessTypeIdx: index("businesses_type_idx")
      .on(table.businessType),

    activeIdx: index("businesses_active_idx")
      .on(table.active),

    registrationNumberIdx: uniqueIndex(
      "businesses_registration_number_unique"
    ).on(table.registrationNumber),

    kraPinIdx: uniqueIndex(
      "businesses_kra_pin_unique"
    ).on(table.kraPin),
  })
);