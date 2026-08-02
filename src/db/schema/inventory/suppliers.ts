import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { products } from "./products";

import { businesses } from "../core/businesses";

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    name: text("name")
      .notNull(),

    contactPerson: text("contact_person"),

    email: text("email"),

    phone: text("phone"),

    kraPin: text("kra_pin"),

    address: text("address"),

    town: text("town"),

    notes: text("notes"),

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
    businessIdx: index("suppliers_business_idx").on(table.businessId),

    nameIdx: index("suppliers_name_idx").on(table.name),

    businessNameUnique: uniqueIndex("suppliers_business_name_unique").on(
      table.businessId,
      table.name
    ),
  })
);

export const suppliersRelations = relations(
  suppliers,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [suppliers.businessId],
      references: [businesses.id],
    }),

    products: many(products),
  })
);