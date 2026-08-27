import {
    and,
    asc,
    eq,
    gt,
    sql,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    inventoryBalances,
} from "@/db/schema/inventory/inventory_balances";
import {
    productBatches,
} from "@/db/schema/inventory/product_batches";

import {
    BaseRepository,
} from "../base";


type InventoryBalanceInsert =
    InferInsertModel<
        typeof inventoryBalances
    >;


export class InventoryBalanceRepository
    extends BaseRepository {

    async findByProductWarehouse(
        productId: string,
        warehouseId: string
    ) {

        return this.database
            .query.inventoryBalances
            .findFirst({
                where: and(
                    eq(
                        inventoryBalances.productId,
                        productId
                    ),

                    eq(
                        inventoryBalances.warehouseId,
                        warehouseId
                    )
                ),
            });
    }


    async findByBatchWarehouse(
        batchId: string,
        warehouseId: string
    ) {

        return this.database
            .query.inventoryBalances
            .findFirst({
                where: and(
                    eq(
                        inventoryBalances.batchId,
                        batchId
                    ),

                    eq(
                        inventoryBalances.warehouseId,
                        warehouseId
                    )
                ),
            });
    }


    async create(
        data: InventoryBalanceInsert
    ) {

        const [balance] =
            await this.database
                .insert(inventoryBalances)
                .values(data)
                .returning();

        return balance;
    }


    async increaseQuantity(
        id: string,
        quantity: number
    ) {

        const [balance] =
            await this.database
                .update(inventoryBalances)
                .set({
                    quantity:
                        sql`${inventoryBalances.quantity} + ${quantity}`,
                })
                .where(
                    eq(
                        inventoryBalances.id,
                        id
                    )
                )
                .returning();

        return balance;
    }


    async decreaseQuantity(
        id: string,
        quantity: number
    ) {
        const [balance] =
            await this.database
                .update(inventoryBalances)
                .set({
                    quantity:
                        sql`${inventoryBalances.quantity} - ${quantity}`,
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(inventoryBalances.id, id),
                        sql`${inventoryBalances.quantity} >= ${quantity}::numeric`,
                    ),
                )
                .returning();

        if (!balance) {
            throw new Error(
                "Insufficient warehouse stock for this movement.",
            );
        }

        return balance;
    }



    /**
     * Source of truth for sales: warehouse balances with qty > 0.
     * Batches joined for FEFO ordering only — missing/inactive batch still sells.
     */
    async findForSaleAllocation(
        businessId: string,
        productId: string,
        warehouseId: string,
    ) {
        return this.database
            .select({
                balanceId: inventoryBalances.id,
                batchId: inventoryBalances.batchId,
                quantity: inventoryBalances.quantity,
                productId: inventoryBalances.productId,
                warehouseId: inventoryBalances.warehouseId,
                expiryDate: productBatches.expiryDate,
                batchActive: productBatches.active,
            })
            .from(inventoryBalances)
            .leftJoin(
                productBatches,
                eq(inventoryBalances.batchId, productBatches.id),
            )
            .where(
                and(
                    eq(inventoryBalances.businessId, businessId),
                    eq(inventoryBalances.productId, productId),
                    eq(inventoryBalances.warehouseId, warehouseId),
                    gt(inventoryBalances.quantity, "0"),
                ),
            )
            .orderBy(
                asc(productBatches.expiryDate),
                asc(inventoryBalances.createdAt),
            );
    }

    async getQuantity(
        productId: string,
        warehouseId: string
    ) {

        const result =
            await this.database
                .select({
                    quantity:
                        sql<number>`
              COALESCE(
                SUM(
                  ${inventoryBalances.quantity}
                ),
                0
              )
            `,
                })
                .from(inventoryBalances)
                .where(
                    and(
                        eq(
                            inventoryBalances.productId,
                            productId
                        ),

                        eq(
                            inventoryBalances.warehouseId,
                            warehouseId
                        )
                    )
                );

        return result[0]?.quantity ?? 0;
    }


    async findByIdForUpdate(id: string) {
        const result = await this.database
            .select()
            .from(inventoryBalances)
            .where(eq(inventoryBalances.id, id))
            .for("update");
        return result[0] ?? null;
    }

    async findByBatchWarehouseForUpdate(
        batchId: string,
        warehouseId: string
    ) {

        const result =
            await this.database
                .select()
                .from(inventoryBalances)
                .where(
                    and(
                        eq(
                            inventoryBalances.batchId,
                            batchId
                        ),

                        eq(
                            inventoryBalances.warehouseId,
                            warehouseId
                        )
                    )
                )
                .for("update");


        return result[0] ?? null;

    }
}


export const inventoryBalanceRepository =
    new InventoryBalanceRepository();