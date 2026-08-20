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

export const productSerials = pgTable(
  "product_serials",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, {
        onDelete: "cascade",
      }),

    batchId: uuid("batch_id")
      .notNull()
      .references(() => productBatches.id, {
        onDelete: "cascade",
      }),

    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id, {
        onDelete: "cascade",
      }),

    serialNumber: text("serial_number")
      .notNull(),

    status: text("status")
      .default("IN_STOCK")
      .notNull(),

    receivedAt: timestamp("received_at")
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    businessIdx: index("product_serials_business_idx")
      .on(table.businessId),

    productIdx: index("product_serials_product_idx")
      .on(table.productId),

    batchIdx: index("product_serials_batch_idx")
      .on(table.batchId),

    warehouseIdx: index("product_serials_warehouse_idx")
      .on(table.warehouseId),

    serialIdx: uniqueIndex("product_serials_business_serial_unique")
      .on(table.businessId, table.serialNumber),

    statusIdx: index("product_serials_status_idx")
      .on(table.status),
  }),
);

export const productSerialsRelations = relations(
  productSerials,
  ({ one }) => ({
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
  }),
);