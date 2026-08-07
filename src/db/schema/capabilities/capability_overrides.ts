import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import {
  businessCapabilities,
} from "./business_capabilities";

import {
  users,
} from "../users/users";


export const capabilityOverrides = pgTable(
  "capability_overrides",
  {

    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessCapabilityId: uuid("business_capability_id")
      .notNull()
      .references(
        () => businessCapabilities.id,
        {
          onDelete: "cascade",
        },
      ),

    changedBy: uuid("changed_by")
      .references(
        () => users.id,
      ),

    previousValue: boolean("previous_value")
      .notNull(),

    newValue: boolean("new_value")
      .notNull(),

    reason: text("reason"),

    createdAt: timestamp(
      "created_at",
      {
        withTimezone: true,
      },
    ).defaultNow(),

  },
  table => ({

    capabilityIdx: index(
      "capability_override_capability_idx",
    ).on(
      table.businessCapabilityId,
    ),

    changedByIdx: index(
      "capability_override_changed_by_idx",
    ).on(
      table.changedBy,
    ),

  }),
);