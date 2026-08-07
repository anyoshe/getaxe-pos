import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  businesses,
} from "../core/businesses";

import {
  capabilities,
} from "./capabilities";


export const businessCapabilities = pgTable(
  "business_capabilities",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    capabilityId: uuid("capability_id")
      .notNull()
      .references(() => capabilities.id, {
        onDelete: "cascade",
      }),

    enabled: boolean("enabled")
      .default(true)
      .notNull(),

    source: text("source")
      .default("PROFILE")
      .notNull(),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone: true,
      },
    ).defaultNow(),

    updatedAt: timestamp(
      "updated_at",
      {
        withTimezone: true,
      },
    ).defaultNow(),

  },
  table => ({

    businessIdx: index(
      "business_capabilities_business_idx",
    ).on(table.businessId),

    capabilityIdx: index(
      "business_capabilities_capability_idx",
    ).on(table.capabilityId),

  }),
);