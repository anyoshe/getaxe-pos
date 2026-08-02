import {
    and,
    eq,
    sql,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    inventoryBalances,
} from "@/db/schema/inventory/inventory_balances";

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