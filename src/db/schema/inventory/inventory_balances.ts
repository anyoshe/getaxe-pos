import {
    pgTable,
    uuid,
    integer,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { businesses } from "../core/businesses";
import { products } from "./products";
import { productBatches } from "./product_batches";
import { warehouses } from "../settings/warehouses";


export const inventoryBalances = pgTable(
    "inventory_balances",
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
            .references(() => productBatches.id, {
                onDelete: "cascade",
            }),

        warehouseId: uuid("warehouse_id")
            .notNull()
            .references(() => warehouses.id, {
                onDelete: "cascade",
            }),

        quantity: integer("quantity")
            .default(0)
            .notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .notNull(),
    },

    (table) => ({
        businessIdx:
            index("inventory_balances_business_idx")
                .on(table.businessId),

        productIdx:
            index("inventory_balances_product_idx")
                .on(table.productId),

        warehouseIdx:
            index("inventory_balances_warehouse_idx")
                .on(table.warehouseId),

        businessProductWarehouseIdx:
            index(
                "inventory_balance_business_product_warehouse_idx"
            ).on(
                table.businessId,
                table.productId,
                table.warehouseId
            ),

        uniqueBalance:
            uniqueIndex(
                "inventory_balance_product_batch_warehouse_unique"
            ).on(
                table.productId,
                table.batchId,
                table.warehouseId
            ),

    })
);


export const inventoryBalancesRelations =
    relations(
        inventoryBalances,
        ({ one }) => ({
            business: one(businesses, {
                fields: [
                    inventoryBalances.businessId,
                ],
                references: [
                    businesses.id,
                ],
            }),

            product: one(products, {
                fields: [
                    inventoryBalances.productId,
                ],
                references: [
                    products.id,
                ],
            }),

            batch: one(productBatches, {
                fields: [
                    inventoryBalances.batchId,
                ],
                references: [
                    productBatches.id,
                ],
            }),

            warehouse: one(warehouses, {
                fields: [
                    inventoryBalances.warehouseId,
                ],
                references: [
                    warehouses.id,
                ],
            }),
        })
    );