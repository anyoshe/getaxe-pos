import {
    asc,
    eq,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    saleItemBatches,
} from "@/db/schema/sales/sale_item_batches";

import {
    BaseRepository,
} from "../base";

type SaleItemBatchInsert =
    InferInsertModel<typeof saleItemBatches>;

export class SaleItemBatchRepository
    extends BaseRepository {

    async findBySaleItem(
        saleItemId: string
    ) {

        return this.database.query.saleItemBatches.findMany({

            where:
                eq(
                    saleItemBatches.saleItemId,
                    saleItemId
                ),

            with: {

                productBatch: true,

            },

            orderBy: [

                asc(
                    saleItemBatches.id
                ),

            ],

        });

    }


    async findById(
        id: string
    ) {

        return this.database.query.saleItemBatches.findFirst({

            where:
                eq(
                    saleItemBatches.id,
                    id
                ),

            with: {

                saleItem: true,

                productBatch: true,

            },

        });

    }


    async create(
        data: SaleItemBatchInsert
    ) {

        const [
            allocation,
        ] =
            await this.database
                .insert(saleItemBatches)
                .values(data)
                .returning();

        return allocation;

    }


    async update(
        id: string,
        data: Partial<SaleItemBatchInsert>
    ) {

        const [
            allocation,
        ] =
            await this.database
                .update(saleItemBatches)
                .set(data)
                .where(
                    eq(
                        saleItemBatches.id,
                        id
                    )
                )
                .returning();

        return allocation;

    }


    async delete(
        id: string
    ) {

        const [
            allocation,
        ] =
            await this.database
                .delete(saleItemBatches)
                .where(
                    eq(
                        saleItemBatches.id,
                        id
                    )
                )
                .returning();

        return allocation;

    }

}

export const saleItemBatchRepository =
    new SaleItemBatchRepository();