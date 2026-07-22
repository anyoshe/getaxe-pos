import {
  pgTable,
  uuid,
  integer,
  numeric,
  date,
  text,
  index,
} from "drizzle-orm/pg-core";

import { goodsReceipts } from "./goods_receipts";
import { products } from "../inventory/products";

export const goodsReceiptItems = pgTable(
  "goods_receipt_items",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    goodsReceiptId: uuid("goods_receipt_id")
      .notNull()
      .references(() => goodsReceipts.id),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    batchNumber: text("batch_number"),

    expiryDate: date("expiry_date"),

    quantity: integer("quantity")
      .notNull(),

    unitCost: numeric("unit_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),

    total: numeric("total", {
      precision: 12,
      scale: 2,
    }).notNull(),
  },
  (table) => ({
    receiptIdx: index("gri_receipt_idx").on(table.goodsReceiptId),

    productIdx: index("gri_product_idx").on(table.productId),
  })
);