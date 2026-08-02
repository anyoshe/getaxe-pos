"use server";

import {
    purchaseOrderService,
} from "../services";


export async function cancelPurchaseOrder(
    purchaseOrderId: string
) {

    return purchaseOrderService.cancelPurchaseOrder(
        purchaseOrderId
    );

}