import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
  index,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { users } from "../users/users";

export const loginHistory = pgTable(
  "login_history",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    userId: uuid("user_id")
      .references(() => users.id),

    loginTime: timestamp("login_time")
      .defaultNow()
      .notNull(),

    logoutTime: timestamp("logout_time"),

    successful: boolean("successful")
      .default(true)
      .notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),
  },
  (table) => ({
    businessIdx: index("login_history_business_idx")
      .on(table.businessId),

    userIdx: index("login_history_user_idx")
      .on(table.userId),
  })
);