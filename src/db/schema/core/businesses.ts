import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { users } from "../users/users";
import { roles } from "../users/roles";

import { branches } from "../settings/branches";
import { warehouses } from "../settings/warehouses";
import { businessSettings } from "../settings/business_settings";
import { units } from "../settings/units";
import { numberingSequences } from "../settings/numbering_sequences";

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

    businessType: text("business_type")
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
      "businesses_registration_number_unique",
    ).on(table.registrationNumber),

    kraPinIdx: uniqueIndex(
      "businesses_kra_pin_unique",
    ).on(table.kraPin),
  }),
);

export const businessesRelations = relations(
  businesses,
  ({ many, one }) => ({
    users: many(users),

    roles: many(roles),

    branches: many(branches),

    warehouses: many(warehouses),

    units: many(units),

    numberingSequences: many(numberingSequences),

    settings: one(businessSettings, {
      fields: [businesses.id],
      references: [businessSettings.businessId],
    }),
  }),
);