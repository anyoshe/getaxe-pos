import {
    asc,
    eq,
} from "drizzle-orm";


import type {
    InferInsertModel,
} from "drizzle-orm";


import {
    saleItems,
} from "@/db/schema/sales/sale_items";


import {
    BaseRepository,
} from "../base";


type SaleItemInsert =
    InferInsertModel<typeof saleItems>;



export class SaleItemRepository
    extends BaseRepository {


    async findBySale(
        saleId: string
    ) {

        return this.database.query.saleItems.findMany({

            where:
                eq(
                    saleItems.saleId,
                    saleId
                ),


            with: {
                product: true,
                batches: {
                    with: {
                        productBatch: true,
                    },
                },
            },


            orderBy: [

                asc(
                    saleItems.id
                ),

            ],

        });

    }



    async findById(
        id: string
    ) {

        return this.database.query.saleItems.findFirst({

            where:
                eq(
                    saleItems.id,
                    id
                ),


            with: {
                sale: true,
                product: true,
                batches: {
                    with: {
                        productBatch: true,
                    },
                },
            },
        });

    }



    async create(
        data: SaleItemInsert
    ) {

        const [
            item,
        ] =
            await this.database
                .insert(saleItems)
                .values(data)
                .returning();


        return item;

    }



    async update(
        id: string,
        data: Partial<SaleItemInsert>
    ) {

        const [
            item,
        ] =
            await this.database
                .update(saleItems)
                .set(data)
                .where(
                    eq(
                        saleItems.id,
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
                .delete(saleItems)
                .where(
                    eq(
                        saleItems.id,
                        id
                    )
                )
                .returning();


        return item;

    }


}



export const saleItemRepository =
    new SaleItemRepository();