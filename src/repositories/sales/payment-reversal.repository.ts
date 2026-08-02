import {
    asc,
    eq,
} from "drizzle-orm";

import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    paymentReversals,
} from "@/db/schema/sales/payment_reversals";

import {
    BaseRepository,
} from "../base";

type PaymentReversalInsert =
    InferInsertModel<
        typeof paymentReversals
    >;

export class PaymentReversalRepository
    extends BaseRepository {

    async findByPayment(
        paymentId: string
    ) {

        return this.database.query.paymentReversals.findMany({

            where:
                eq(
                    paymentReversals.paymentId,
                    paymentId
                ),

            with: {

                payment: true,

                reversedByUser: true,

            },

            orderBy: [

                asc(
                    paymentReversals.reversedAt
                ),

            ],

        });

    }

    async create(
        data: PaymentReversalInsert
    ) {

        const [
            reversal,
        ] =
            await this.database
                .insert(paymentReversals)
                .values(data)
                .returning();

        return reversal;

    }

}