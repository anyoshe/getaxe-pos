import {
  pgTable,
  uuid,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    module: text("module")
      .notNull(),

    description: text("description"),
  },
  (table) => ({
    codeUnique: uniqueIndex(
      "permissions_code_unique"
    ).on(table.code),

    nameUnique: uniqueIndex(
      "permissions_name_unique"
    ).on(table.name),

    moduleIdx: index(
      "permissions_module_idx"
    ).on(table.module),
  })
);