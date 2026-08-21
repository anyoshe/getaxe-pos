import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { products } from "./products";
import { productBatches } from "./product_batches";
import { warehouses } from "../settings/warehouses";
import { stockMovements } from "./stock_movements";

/**
 * Individual serial numbers for serialized products.
 * Status lifecycle: AVAILABLE → SOLD / RESERVED / DAMAGED / RETURNED
 */
export const productSerials = pgTable(
  "product_serials",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    batchId: uuid("batch_id").references(() => productBatches.id, {
      onDelete: "set null",
    }),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, { onDelete: "cascade" }),

    serialNumber: text("serial_number").notNull(),

    status: text("status").notNull().default("AVAILABLE"),

    stockMovementId: uuid("stock_movement_id").references(
      () => stockMovements.id,
      { onDelete: "set null" },
    ),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessIdx: index("product_serials_business_idx").on(table.businessId),
    productIdx: index("product_serials_product_idx").on(table.productId),
    batchIdx: index("product_serials_batch_idx").on(table.batchId),
    warehouseIdx: index("product_serials_warehouse_idx").on(table.warehouseId),
    statusIdx: index("product_serials_status_idx").on(table.status),
    uniqueSerial: uniqueIndex("product_serials_business_serial_unique").on(
      table.businessId,
      table.serialNumber,
    ),
  }),
);

export const productSerialsRelations = relations(productSerials, ({ one }) => ({
  business: one(businesses, {
    fields: [productSerials.businessId],
    references: [businesses.id],
  }),
  product: one(products, {
    fields: [productSerials.productId],
    references: [products.id],
  }),
  batch: one(productBatches, {
    fields: [productSerials.batchId],
    references: [productBatches.id],
  }),
  warehouse: one(warehouses, {
    fields: [productSerials.warehouseId],
    references: [warehouses.id],
  }),
  stockMovement: one(stockMovements, {
    fields: [productSerials.stockMovementId],
    references: [stockMovements.id],
  }),
}));
