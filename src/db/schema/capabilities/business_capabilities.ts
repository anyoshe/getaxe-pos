import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

    capabilityId: text("capability_id")
      .notNull()
      .references(() => capabilities.capabilityId, {
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

    businessCapabilityUnique: uniqueIndex(
      "business_capabilities_business_capability_unique",
    ).on(table.businessId, table.capabilityId),
  }),
);