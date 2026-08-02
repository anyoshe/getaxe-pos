"use server";

import {
    purchaseOrderService,
} from "../services";

import type {
    CreatePurchaseOrderRequest,
} from "../types";


export async function createPurchaseOrder(
    request: CreatePurchaseOrderRequest
) {

    return purchaseOrderService.createPurchaseOrder(
        request
    );

}