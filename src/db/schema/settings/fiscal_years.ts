import {
  pgTable,
  uuid,
  text,
  boolean,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";

export const fiscalYears = pgTable(
  "fiscal_years",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    startDate: date("start_date")
      .notNull(),

    endDate: date("end_date")
      .notNull(),

    isCurrent: boolean("is_current")
      .default(false)
      .notNull(),

    isClosed: boolean("is_closed")
      .default(false)
      .notNull(),

    allowPosting: boolean("allow_posting")
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
    businessIdx: index("fiscal_years_business_idx")
      .on(table.businessId),

    currentIdx: index("fiscal_years_current_idx")
      .on(table.isCurrent),

    closedIdx: index("fiscal_years_closed_idx")
      .on(table.isClosed),

    allowPostingIdx: index(
      "fiscal_years_allow_posting_idx"
    ).on(table.allowPosting),

    uniqueCode: uniqueIndex(
      "fiscal_years_business_code_unique"
    ).on(
      table.businessId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "fiscal_years_business_name_unique"
    ).on(
      table.businessId,
      table.name
    ),
  })
);