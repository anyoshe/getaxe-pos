import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { businesses } from "../core/businesses";
import { products } from "./products";
import { suppliers } from "./suppliers";

export const productBatches = pgTable(
  "product_batches",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    supplierId: uuid("supplier_id")
      .references(() => suppliers.id),

    batchNumber: text("batch_number").notNull(),

    manufactureDate: date("manufacture_date"),

    expiryDate: date("expiry_date"),

    purchaseInvoice: text("purchase_invoice"),

    costPrice: numeric("cost_price", {
      precision: 12,
      scale: 2,
    }).notNull(),

    sellingPrice: numeric("selling_price", {
      precision: 12,
      scale: 2,
    }),

    quantityReceived: integer("quantity_received")
      .notNull(),

    quantityRemaining: integer("quantity_remaining")
      .notNull(),

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
    businessIdx: index("batch_business_idx").on(table.businessId),

    productIdx: index("batch_product_idx").on(table.productId),

    supplierIdx: index("batch_supplier_idx").on(table.supplierId),

    expiryIdx: index("batch_expiry_idx").on(table.expiryDate),

    uniqueBatch: uniqueIndex("product_batch_unique").on(
      table.businessId,
      table.productId,
      table.batchNumber
    ),
  })
);