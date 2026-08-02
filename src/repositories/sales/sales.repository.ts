import {
    asc,
    eq,
    and,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    sales,
} from "@/db/schema/sales/sales";

import {
    BaseRepository,
} from "../base";


type SaleInsert =
    InferInsertModel<typeof sales>;


export class SaleRepository
    extends BaseRepository {


    async findAll(
        businessId: string
    ) {

        return this.database.query.sales.findMany({

            where:
                eq(
                    sales.businessId,
                    businessId
                ),

            with: {

                customer: true,

                branch: true,

                warehouse: true,

                soldBy: true,

                items: true,

                payments: true,

            },

            orderBy: [

                asc(
                    sales.invoiceNumber
                ),

            ],

        });

    }


    async findById(
        id: string
    ) {

        return this.database.query.sales.findFirst({

            where:
                eq(
                    sales.id,
                    id
                ),

            with: {

                customer: true,

                branch: true,

                warehouse: true,

                soldBy: true,

                items: true,

                payments: true,

            },

        });

    }


    async create(
        data: SaleInsert
    ) {

        const [
            sale,
        ] =
            await this.database
                .insert(sales)
                .values(data)
                .returning();


        return sale;

    }


    async update(
        id: string,
        data: Partial<SaleInsert>
    ) {

        const [
            sale,
        ] =
            await this.database
                .update(sales)
                .set(data)
                .where(
                    eq(
                        sales.id,
                        id
                    )
                )
                .returning();


        return sale;

    }


    async delete(
        id: string
    ) {

        const [
            sale,
        ] =
            await this.database
                .delete(sales)
                .where(
                    eq(
                        sales.id,
                        id
                    )
                )
                .returning();


        return sale;

    }


    async findByInvoiceNumber(
        businessId: string,
        invoiceNumber: string
    ) {

        return this.database.query.sales.findFirst({

            where:
                and(

                    eq(
                        sales.businessId,
                        businessId
                    ),

                    eq(
                        sales.invoiceNumber,
                        invoiceNumber
                    )

                ),

            with: {

                customer: true,

            },

        });

    }


}


export const saleRepository =
    new SaleRepository();