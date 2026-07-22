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
import { branches } from "./branches";

export const warehouses = pgTable(
  "warehouses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, {
        onDelete: "cascade",
      }),

    code: text("code")
      .notNull(),

    name: text("name")
      .notNull(),

    description: text("description"),

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
    businessIdx: index("warehouses_business_idx")
      .on(table.businessId),

    branchIdx: index("warehouses_branch_idx")
      .on(table.branchId),

    activeIdx: index("warehouses_active_idx")
      .on(table.active),

    uniqueCode: uniqueIndex(
      "warehouses_branch_code_unique"
    ).on(
      table.branchId,
      table.code
    ),

    uniqueName: uniqueIndex(
      "warehouses_branch_name_unique"
    ).on(
      table.branchId,
      table.name
    ),
  })
);