import {
    eq,
    desc,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    BaseRepository,
} from "../base";

import {
    goodsReceipts,
} from "@/db/schema/purchasing/goods_receipts";


type GoodsReceiptInsert =
    InferInsertModel<typeof goodsReceipts>;


export class GoodsReceiptRepository
    extends BaseRepository {


    async findAll(
        businessId: string
    ) {

        return this.database
            .query
            .goodsReceipts
            .findMany({

                where:
                    eq(
                        goodsReceipts.businessId,
                        businessId
                    ),

                with: {
                    supplier: true,
                    items: true,
                },

                orderBy: [
                    desc(
                        goodsReceipts.createdAt
                    ),
                ],

            });

    }


    async findById(
        id: string
    ) {

        return this.database
            .query
            .goodsReceipts
            .findFirst({

                where:
                    eq(
                        goodsReceipts.id,
                        id
                    ),

                with: {
                    supplier: true,
                    items: true,
                },

            });

    }


    async create(
        data: GoodsReceiptInsert
    ) {

        const [
            receipt,
        ] =
            await this.database
                .insert(goodsReceipts)
                .values(data)
                .returning();


        return receipt;

    }


    async updateStatus(
        id: string,
        status:
            | "DRAFT"
            | "POSTED"
            | "CANCELLED"
    ) {

        const [
            receipt,
        ] =
            await this.database
                .update(goodsReceipts)
                .set({
                    status,
                })
                .where(
                    eq(
                        goodsReceipts.id,
                        id
                    )
                )
                .returning();


        return receipt;

    }

}