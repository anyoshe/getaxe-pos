import {
    pgTable,
    uuid,
    text,
    integer,
    timestamp,
    index,
    numeric,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { businesses } from "../core/businesses";
import { products } from "./products";
import { productBatches } from "./product_batches";
import { users } from "../users/users";
import { stockMovementTypeEnum } from "../shared";
import { warehouses } from "../settings/warehouses";

export const stockMovements = pgTable(
    "stock_movements",
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

        batchId: uuid("batch_id")
            .references(() => productBatches.id),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id),

        userId: uuid("user_id")
            .references(() => users.id),

        movementType: stockMovementTypeEnum("movement_type")
            .notNull(),

        quantity: integer("quantity")
            .notNull(),

        unitCost: numeric("unit_cost", {
            precision: 12,
            scale: 2,
        }),

        reference: text("reference"),

        notes: text("notes"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        businessIdx: index("stock_business_idx").on(table.businessId),

        productIdx: index("stock_product_idx").on(table.productId),

        batchIdx: index("stock_batch_idx").on(table.batchId),

        userIdx: index("stock_user_idx").on(table.userId),

        movementIdx: index("stock_type_idx").on(table.movementType),

        createdIdx: index("stock_created_idx").on(table.createdAt),
    })
);

export const stockMovementsRelations = relations(
  stockMovements,
  ({ one }) => ({
    business: one(businesses, {
      fields: [stockMovements.businessId],
      references: [businesses.id],
    }),

    product: one(products, {
      fields: [stockMovements.productId],
      references: [products.id],
    }),

    batch: one(productBatches, {
      fields: [stockMovements.batchId],
      references: [productBatches.id],
    }),

    warehouse: one(warehouses, {
      fields: [stockMovements.warehouseId],
      references: [warehouses.id],
    }),

    user: one(users, {
      fields: [stockMovements.userId],
      references: [users.id],
    }),
  })
);