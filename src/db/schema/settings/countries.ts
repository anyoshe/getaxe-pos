import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const countries = pgTable(
  "countries",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    code: text("code")
      .notNull(),

    iso3: text("iso3")
      .notNull(),

    name: text("name")
      .notNull(),

    phoneCode: text("phone_code"),

    currencyCode: text("currency_code"),

    timezone: text("timezone"),

    active: boolean("active")
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
    codeUnique: uniqueIndex(
      "countries_code_unique"
    ).on(table.code),

    iso3Unique: uniqueIndex(
      "countries_iso3_unique"
    ).on(table.iso3),

    nameUnique: uniqueIndex(
      "countries_name_unique"
    ).on(table.name),

    activeIdx: index(
      "countries_active_idx"
    ).on(table.active),
  })
);