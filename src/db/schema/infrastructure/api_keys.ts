import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";


export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    name: text("name")
      .notNull(),

    keyHash: text("key_hash")
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    lastUsedAt: timestamp("last_used_at"),

    expiresAt: timestamp("expires_at"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    businessIdx: index("api_keys_business_idx")
      .on(table.businessId),

    activeIdx: index("api_keys_active_idx")
      .on(table.active),

    keyHashUnique: uniqueIndex("api_keys_hash_unique")
      .on(table.keyHash),
  })
);


export const apiKeysRelations = relations(
  apiKeys,
  ({ one }) => ({
    business: one(businesses, {
      fields: [apiKeys.businessId],
      references: [businesses.id],
    }),
  })
);