"use server";

import {
    purchaseOrderService,
} from "../services";

import type {
    ApprovePurchaseOrderRequest,
} from "../types";


export async function approvePurchaseOrder(
    request: ApprovePurchaseOrderRequest
) {

    return purchaseOrderService.approvePurchaseOrder(
        request
    );

}