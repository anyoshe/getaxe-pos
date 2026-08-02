"use server";

import {
    paymentService,
} from "../services";

import type {
    PaymentInsert,
} from "../types";


export async function recordPayment(
    saleId: string,
    payments: PaymentInsert[]
) {

    return paymentService.recordPayment({
        saleId,
        payments,
    });

}