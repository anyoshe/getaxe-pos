import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { users } from "../users/users";
import {
  activityActionEnum,
  entityTypeEnum,
} from "../shared";
import { relations } from "drizzle-orm";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    userId: uuid("user_id")
      .references(() => users.id),

    action: activityActionEnum("action")
      .notNull(),

    entity: entityTypeEnum("entity")
      .notNull(),

    entityId: uuid("entity_id"),

    description: text("description"),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("activity_logs_business_idx")
      .on(table.businessId),

    userIdx: index("activity_logs_user_idx")
      .on(table.userId),

    entityIdx: index("activity_logs_entity_idx")
      .on(table.entity),

    createdIdx: index("activity_logs_created_idx")
      .on(table.createdAt),
  })
);


export const activityLogsRelations = relations(
  activityLogs,
  ({ one }) => ({
    business: one(businesses, {
      fields: [activityLogs.businessId],
      references: [businesses.id],
    }),

    user: one(users, {
      fields: [activityLogs.userId],
      references: [users.id],
    }),
  })
);