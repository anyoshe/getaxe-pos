import {
    and,
    asc,
    eq,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    saleReturns,
} from "@/db/schema/sales/sale_returns";

import {
    BaseRepository,
} from "../base";

type SaleReturnInsert =
    InferInsertModel<typeof saleReturns>;

export class SaleReturnRepository
    extends BaseRepository {

    async findAll(
        businessId: string
    ) {

        return this.database.query.saleReturns.findMany({

            where:
                eq(
                    saleReturns.businessId,
                    businessId
                ),

            with: {

                sale: true,

                customer: true,

                createdByUser: true,

                approvedByUser: true,

                items: true,

            },

            orderBy: [

                asc(
                    saleReturns.returnNumber
                ),

            ],

        });

    }


    async findById(
        id: string
    ) {

        return this.database.query.saleReturns.findFirst({

            where:
                eq(
                    saleReturns.id,
                    id
                ),

            with: {

                sale: true,

                customer: true,

                createdByUser: true,

                approvedByUser: true,

                items: true,

            },

        });

    }


    async create(
        data: SaleReturnInsert
    ) {

        const [
            saleReturn,
        ] =
            await this.database
                .insert(saleReturns)
                .values(data)
                .returning();

        return saleReturn;

    }


    async update(
        id: string,
        data: Partial<SaleReturnInsert>
    ) {

        const [
            saleReturn,
        ] =
            await this.database
                .update(saleReturns)
                .set(data)
                .where(
                    eq(
                        saleReturns.id,
                        id
                    )
                )
                .returning();

        return saleReturn;

    }


    async delete(
        id: string
    ) {

        const [
            saleReturn,
        ] =
            await this.database
                .delete(saleReturns)
                .where(
                    eq(
                        saleReturns.id,
                        id
                    )
                )
                .returning();

        return saleReturn;

    }


    async findByReturnNumber(
        businessId: string,
        returnNumber: string
    ) {

        return this.database.query.saleReturns.findFirst({

            where:
                and(

                    eq(
                        saleReturns.businessId,
                        businessId
                    ),

                    eq(
                        saleReturns.returnNumber,
                        returnNumber
                    ),

                ),

            with: {

                customer: true,

                sale: true,

            },

        });

    }

}

export const saleReturnRepository =
    new SaleReturnRepository();