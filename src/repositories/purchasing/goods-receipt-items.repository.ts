import type {
    InferInsertModel,
} from "drizzle-orm";


import {
    BaseRepository,
} from "../base";


import {
    goodsReceiptItems,
} from "@/db/schema/purchasing/goods_receipt_items";


type GoodsReceiptItemInsert =
    InferInsertModel<
        typeof goodsReceiptItems
    >;


export class GoodsReceiptItemRepository
    extends BaseRepository {


    async findByReceipt(
        receiptId: string
    ) {

        return this.database
            .query
            .goodsReceiptItems
            .findMany({

                where:
                    (
                        items,
                        { eq }
                    ) =>
                        eq(
                            items.goodsReceiptId,
                            receiptId
                        ),

                with: {
                    product: true,
                },

            });

    }

    async create(
        data: GoodsReceiptItemInsert
    ) {

        const [item] =
            await this.database
                .insert(goodsReceiptItems)
                .values(data)
                .returning();

        return item;

    }

    async createMany(
        data: GoodsReceiptItemInsert[]
    ) {

        return this.database
            .insert(goodsReceiptItems)
            .values(data)
            .returning();

    }

}