import {
    pgTable,
    uuid,
    numeric,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

import { dispensations } from "./dispensations";
import { prescriptionItems } from "./prescription_items";
import { saleItems } from "../sales/sale_items";
import { products } from "../inventory/products";
import { productBatches } from "../inventory/product_batches";
import { relations } from "drizzle-orm";

export const dispensationItems = pgTable(
    "dispensation_items",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        dispensationId: uuid("dispensation_id")
            .notNull()
            .references(() => dispensations.id, {
                onDelete: "cascade",
            }),

        prescriptionItemId: uuid("prescription_item_id")
            .notNull()
            .references(() => prescriptionItems.id),

        saleItemId: uuid("sale_item_id")
            .references(() => saleItems.id),

        productId: uuid("product_id")
            .notNull()
            .references(() => products.id),

        productBatchId: uuid("product_batch_id")
            .notNull()
            .references(() => productBatches.id),

        quantityDispensed: numeric("quantity_dispensed", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

        unitPrice: numeric("unit_price", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

        discountAmount: numeric("discount_amount", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        totalAmount: numeric("total_amount", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

        taxAmount: numeric("tax_amount", {
            precision: 12,
            scale: 2,
        })
            .default("0")
            .notNull(),

        directionsGiven: text("directions_given"),

        pharmacistNotes: text("pharmacist_notes"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        dispensationIdx: index(
            "dispensation_items_dispensation_idx"
        ).on(table.dispensationId),

        prescriptionItemIdx: index(
            "dispensation_items_prescription_item_idx"
        ).on(table.prescriptionItemId),

        saleItemIdx: index(
            "dispensation_items_sale_item_idx"
        ).on(table.saleItemId),

        productIdx: index(
            "dispensation_items_product_idx"
        ).on(table.productId),

        batchIdx: index(
            "dispensation_items_batch_idx"
        ).on(table.productBatchId),
    })
);
export const dispensationItemsRelations = relations(
  dispensationItems,
  ({ one }) => ({
    dispensation: one(dispensations, {
      fields: [dispensationItems.dispensationId],
      references: [dispensations.id],
    }),

    prescriptionItem: one(prescriptionItems, {
      fields: [dispensationItems.prescriptionItemId],
      references: [prescriptionItems.id],
    }),

    saleItem: one(saleItems, {
      fields: [dispensationItems.saleItemId],
      references: [saleItems.id],
    }),

    product: one(products, {
      fields: [dispensationItems.productId],
      references: [products.id],
    }),

    productBatch: one(productBatches, {
      fields: [dispensationItems.productBatchId],
      references: [productBatches.id],
    }),
  })
);