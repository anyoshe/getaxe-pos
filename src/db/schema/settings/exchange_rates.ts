import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  date,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businesses } from "../core/businesses";

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    fromCurrency: text("from_currency").notNull(),
    toCurrency: text("to_currency").notNull(),
    rate: numeric("rate", { precision: 18, scale: 8 }).notNull(),
    effectiveDate: date("effective_date").defaultNow().notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    businessIdx: index("exchange_rates_business_idx").on(t.businessId),
    pairUnique: uniqueIndex("exchange_rates_business_pair_date_unique").on(
      t.businessId,
      t.fromCurrency,
      t.toCurrency,
      t.effectiveDate,
    ),
  }),
);
