import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { businesses } from "../core/businesses";
import { customers } from "../sales/customers";
import { users } from "../users/users";

export const loyaltyPrograms = pgTable(
  "loyalty_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Default rewards"),
    pointsPerAmount: numeric("points_per_amount", { precision: 12, scale: 4 })
      .notNull()
      .default("1"),
    amountPerPointUnit: numeric("amount_per_point_unit", {
      precision: 12,
      scale: 2,
    })
      .notNull()
      .default("100"),
    redemptionValuePerPoint: numeric("redemption_value_per_point", {
      precision: 12,
      scale: 4,
    })
      .notNull()
      .default("1"),
    minRedeemPoints: integer("min_redeem_points").notNull().default(100),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    businessUnique: uniqueIndex("loyalty_programs_business_unique").on(
      t.businessId,
    ),
  }),
);

export const loyaltyTransactions = pgTable(
  "loyalty_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // EARN | REDEEM | ADJUST | BONUS
    points: integer("points").notNull(),
    balanceAfter: integer("balance_after").notNull().default(0),
    reference: text("reference"),
    saleId: uuid("sale_id"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    customerIdx: index("loyalty_transactions_customer_idx").on(t.customerId),
    businessIdx: index("loyalty_transactions_business_idx").on(t.businessId),
  }),
);
