import type {
    InferInsertModel,
} from "drizzle-orm";

import {
    paymentReversals,
} from "@/db/schema/sales/payment_reversals";

export type PaymentReversalInsert =
    InferInsertModel<
        typeof paymentReversals
    >;

export interface CreatePaymentReversalRequest {

    paymentReversal:
        PaymentReversalInsert;

}