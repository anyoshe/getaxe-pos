import {
    asc,
    eq,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    saleReturnItems,
} from "@/db/schema/sales/sale_return_items";

import {
    BaseRepository,
} from "../base";

type SaleReturnItemInsert =
    InferInsertModel<typeof saleReturnItems>;

export class SaleReturnItemRepository
    extends BaseRepository {

    async findBySaleReturn(
        saleReturnId: string
    ) {

        return this.database.query.saleReturnItems.findMany({

            where:
                eq(
                    saleReturnItems.saleReturnId,
                    saleReturnId
                ),

            with: {

                saleItem: true,

                productBatch: true,

            },

            orderBy: [

                asc(
                    saleReturnItems.id
                ),

            ],

        });

    }


    async findById(
        id: string
    ) {

        return this.database.query.saleReturnItems.findFirst({

            where:
                eq(
                    saleReturnItems.id,
                    id
                ),

            with: {

                saleReturn: true,

                saleItem: true,

                productBatch: true,

            },

        });

    }


    async create(
        data: SaleReturnItemInsert
    ) {

        const [
            item,
        ] =
            await this.database
                .insert(saleReturnItems)
                .values(data)
                .returning();

        return item;

    }


    async update(
        id: string,
        data: Partial<SaleReturnItemInsert>
    ) {

        const [
            item,
        ] =
            await this.database
                .update(saleReturnItems)
                .set(data)
                .where(
                    eq(
                        saleReturnItems.id,
                        id
                    )
                )
                .returning();

        return item;

    }


    async delete(
        id: string
    ) {

        const [
            item,
        ] =
            await this.database
                .delete(saleReturnItems)
                .where(
                    eq(
                        saleReturnItems.id,
                        id
                    )
                )
                .returning();

        return item;

    }

}

export const saleReturnItemRepository =
    new SaleReturnItemRepository();