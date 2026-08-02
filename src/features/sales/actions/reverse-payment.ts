"use server";

import {
    paymentService,
} from "../services";

import type {
    ReversePaymentRequest,
} from "../types";


export async function reversePayment(
    request: ReversePaymentRequest
) {

    return paymentService.reversePaymentTransaction(
        request
    );

}