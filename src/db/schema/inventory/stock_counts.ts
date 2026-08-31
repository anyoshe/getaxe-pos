import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { users } from "../users/users";
import { warehouses } from "../settings/warehouses";
import { products } from "./products";
import { productBatches } from "./product_batches";

export const stockCounts = pgTable(
  "stock_counts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    status: text("status").notNull().default("DRAFT"),
    reference: text("reference"),
    notes: text("notes"),
    countedBy: uuid("counted_by").references(() => users.id),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    businessIdx: index("stock_counts_business_idx").on(t.businessId),
    warehouseIdx: index("stock_counts_warehouse_idx").on(t.warehouseId),
    statusIdx: index("stock_counts_status_idx").on(t.status),
  }),
);

export const stockCountItems = pgTable(
  "stock_count_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    stockCountId: uuid("stock_count_id")
      .notNull()
      .references(() => stockCounts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    batchId: uuid("batch_id").references(() => productBatches.id),
    systemQuantity: numeric("system_quantity", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    countedQuantity: numeric("counted_quantity", { precision: 18, scale: 4 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    countIdx: index("stock_count_items_count_idx").on(t.stockCountId),
    productIdx: index("stock_count_items_product_idx").on(t.productId),
  }),
);

export const stockCountsRelations = relations(stockCounts, ({ one, many }) => ({
  business: one(businesses, {
    fields: [stockCounts.businessId],
    references: [businesses.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockCounts.warehouseId],
    references: [warehouses.id],
  }),
  items: many(stockCountItems),
}));

export const stockCountItemsRelations = relations(stockCountItems, ({ one }) => ({
  stockCount: one(stockCounts, {
    fields: [stockCountItems.stockCountId],
    references: [stockCounts.id],
  }),
  product: one(products, {
    fields: [stockCountItems.productId],
    references: [products.id],
  }),
  batch: one(productBatches, {
    fields: [stockCountItems.batchId],
    references: [productBatches.id],
  }),
}));
