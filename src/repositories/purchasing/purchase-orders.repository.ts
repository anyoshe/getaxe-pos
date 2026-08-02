import {
    asc,
    eq,
    and,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    purchaseOrders,
} from "@/db/schema/purchasing/purchase_orders";

import {
    BaseRepository,
} from "../base";

type PurchaseOrderInsert =
    InferInsertModel<typeof purchaseOrders>;

export class PurchaseOrderRepository
    extends BaseRepository {

    async findAll(
        businessId: string
    ) {

        return this.database.query.purchaseOrders.findMany({
            where: eq(
                purchaseOrders.businessId,
                businessId
            ),

            with: {
                supplier: true,
                orderedByUser: true,
                approvedByUser: true,
            },

            orderBy: [
                asc(purchaseOrders.orderNumber),
            ],
        });

    }

    async findById(
        id: string
    ) {

        return this.database.query.purchaseOrders.findFirst({
            where: eq(
                purchaseOrders.id,
                id
            ),

            with: {
                supplier: true,
                orderedByUser: true,
                approvedByUser: true,
                items: true,
                goodsReceipts: true,
            },
        });

    }

    async create(
        data: PurchaseOrderInsert
    ) {

        const [purchaseOrder] =
            await this.database
                .insert(purchaseOrders)
                .values(data)
                .returning();

        return purchaseOrder;

    }

    async update(
        id: string,
        data: Partial<PurchaseOrderInsert>
    ) {

        const [purchaseOrder] =
            await this.database
                .update(purchaseOrders)
                .set(data)
                .where(
                    eq(
                        purchaseOrders.id,
                        id
                    )
                )
                .returning();

        return purchaseOrder;

    }

    async delete(
        id: string
    ) {

        const [purchaseOrder] =
            await this.database
                .delete(purchaseOrders)
                .where(
                    eq(
                        purchaseOrders.id,
                        id
                    )
                )
                .returning();

        return purchaseOrder;

    }

    async findByOrderNumber(
        businessId: string,
        orderNumber: string
    ) {

        return this.database.query.purchaseOrders.findFirst({
            where: and(
                eq(
                    purchaseOrders.businessId,
                    businessId
                ),
                eq(
                    purchaseOrders.orderNumber,
                    orderNumber
                )
            ),

            with: {
                supplier: true,
            },
        });

    }

}

export const purchaseOrderRepository =
    new PurchaseOrderRepository();