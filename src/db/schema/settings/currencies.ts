import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const currencies = pgTable(
  "currencies",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    symbol: text("symbol")
      .notNull(),

    decimalPlaces: integer("decimal_places")
      .default(2)
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    isDefault: boolean("is_default")
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
    codeUnique: uniqueIndex("currencies_code_unique")
      .on(table.code),

    nameUnique: uniqueIndex("currencies_name_unique")
      .on(table.name),

    activeIdx: index("currencies_active_idx")
      .on(table.active),

    defaultIdx: index("currencies_default_idx")
      .on(table.isDefault),
  })
);