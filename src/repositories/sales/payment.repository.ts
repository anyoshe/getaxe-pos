import {
    and,
    asc,
    eq,
    sql,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    payments,
} from "@/db/schema/sales/payments";

import {
    BaseRepository,
} from "../base";

type PaymentInsert =
    InferInsertModel<typeof payments>;

export class PaymentRepository
    extends BaseRepository {

    async findAll(
        businessId: string
    ) {

        return this.database.query.payments.findMany({

            where:
                eq(
                    payments.businessId,
                    businessId
                ),

            with: {

                sale: true,

                cashAccount: true,

                receivedByUser: true,

            },

            orderBy: [

                asc(
                    payments.paidAt
                ),

            ],

        });

    }


    async findById(
        id: string
    ) {

        return this.database.query.payments.findFirst({

            where:
                eq(
                    payments.id,
                    id
                ),

            with: {

                sale: true,

                cashAccount: true,

                receivedByUser: true,

            },

        });

    }


    async create(
        data: PaymentInsert
    ) {

        const [
            payment,
        ] =
            await this.database
                .insert(payments)
                .values(data)
                .returning();

        return payment;

    }


    async update(
        id: string,
        data: Partial<PaymentInsert>
    ) {

        const [
            payment,
        ] =
            await this.database
                .update(payments)
                .set(data)
                .where(
                    eq(
                        payments.id,
                        id
                    )
                )
                .returning();

        return payment;

    }


    async delete(
        id: string
    ) {

        const [
            payment,
        ] =
            await this.database
                .delete(payments)
                .where(
                    eq(
                        payments.id,
                        id
                    )
                )
                .returning();

        return payment;

    }


    async findByReference(
        businessId: string,
        transactionReference: string
    ) {

        return this.database.query.payments.findFirst({

            where:
                and(

                    eq(
                        payments.businessId,
                        businessId
                    ),

                    eq(
                        payments.transactionReference,
                        transactionReference
                    ),

                ),

            with: {

                sale: true,

            },

        });

    }

    async findBySale(
        saleId: string
    ) {

        return this.database.query.payments.findMany({

            where:
                eq(
                    payments.saleId,
                    saleId
                ),

            orderBy: [

                asc(
                    payments.paidAt
                ),

            ],

        });

    }
    async getTotalPaid(
        saleId: string
    ) {

        const result =
            await this.database
                .select({

                    total:
                        sql<number>`
                        COALESCE(
                            SUM(${payments.amount}),
                            0
                        )
                    `,

                })
                .from(payments)
                .where(

                    and(

                        eq(
                            payments.saleId,
                            saleId
                        ),

                        eq(
                            payments.status,
                            "COMPLETED"
                        )

                    )

                );

        return Number(
            result[0]?.total ?? 0
        );

    }

    async findCompletedBySale(
        saleId: string
    ) {

        return this.database.query.payments.findMany({

            where:
                and(

                    eq(
                        payments.saleId,
                        saleId
                    ),

                    eq(
                        payments.status,
                        "COMPLETED"
                    )

                ),

            orderBy: [

                asc(
                    payments.paidAt
                ),

            ],

        });

    }

}

export const paymentRepository =
    new PaymentRepository();