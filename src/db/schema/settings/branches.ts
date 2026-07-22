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

export const branches = pgTable(
  "branches",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    phone: text("phone"),

    email: text("email"),

    county: text("county"),

    town: text("town"),

    address: text("address"),

    active: boolean("active")
      .default(true)
      .notNull(),

    isHeadOffice: boolean("is_head_office")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("branches_business_idx")
      .on(table.businessId),

    activeIdx: index("branches_active_idx")
      .on(table.active),

    headOfficeIdx: index("branches_head_office_idx")
      .on(table.isHeadOffice),

    uniqueCode: uniqueIndex(
      "branches_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "branches_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);