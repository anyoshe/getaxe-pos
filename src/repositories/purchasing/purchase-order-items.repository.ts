import {
    asc,
    eq,
    sql,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    purchaseOrderItems,
} from "@/db/schema/purchasing/purchase_order_items";

import {
    BaseRepository,
} from "../base";

type PurchaseOrderItemInsert =
    InferInsertModel<typeof purchaseOrderItems>;

export class PurchaseOrderItemRepository
    extends BaseRepository {

    async findByPurchaseOrder(
        purchaseOrderId: string
    ) {

        return this.database.query.purchaseOrderItems.findMany({
            where: eq(
                purchaseOrderItems.purchaseOrderId,
                purchaseOrderId
            ),

            with: {
                product: true,
            },

            orderBy: [
                asc(purchaseOrderItems.id),
            ],
        });

    }

    async findByPurchaseOrderAndProduct(
        purchaseOrderId: string,
        productId: string
    ) {

        return this.database
            .query
            .purchaseOrderItems
            .findFirst({

                where: (
                    item,
                    { and, eq }
                ) =>
                    and(
                        eq(
                            item.purchaseOrderId,
                            purchaseOrderId
                        ),

                        eq(
                            item.productId,
                            productId
                        )
                    ),

                with: {
                    product: true,
                },

            });

    }

    async findById(
        id: string
    ) {

        return this.database.query.purchaseOrderItems.findFirst({
            where: eq(
                purchaseOrderItems.id,
                id
            ),

            with: {
                product: true,
                goodsReceiptItems: true,
            },
        });

    }

    async create(
        data: PurchaseOrderItemInsert
    ) {

        const [item] =
            await this.database
                .insert(purchaseOrderItems)
                .values(data)
                .returning();

        return item;

    }

    async update(
        id: string,
        data: Partial<PurchaseOrderItemInsert>
    ) {

        const [item] =
            await this.database
                .update(purchaseOrderItems)
                .set(data)
                .where(
                    eq(
                        purchaseOrderItems.id,
                        id
                    )
                )
                .returning();

        return item;

    }

    async delete(
        id: string
    ) {

        const [item] =
            await this.database
                .delete(purchaseOrderItems)
                .where(
                    eq(
                        purchaseOrderItems.id,
                        id
                    )
                )
                .returning();

        return item;

    }

    async increaseReceivedQuantity(
        id: string,
        quantity: number
    ) {

        const [item] =
            await this.database
                .update(purchaseOrderItems)
                .set({
                    receivedQuantity:
                        sql`${purchaseOrderItems.receivedQuantity} + ${quantity}`,
                })
                .where(
                    eq(
                        purchaseOrderItems.id,
                        id
                    )
                )
                .returning();

        return item;

    }

}

export const purchaseOrderItemRepository =
    new PurchaseOrderItemRepository();