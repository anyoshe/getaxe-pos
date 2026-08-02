"use server";

import {
    purchasesQueryService,
} from "../services";


export async function getPurchaseOrders(
    businessId: string
) {

    return purchasesQueryService.getPurchaseOrders(
        businessId
    );

}


export async function getPurchaseOrder(
    purchaseOrderId: string
) {

    return purchasesQueryService.getPurchaseOrder(
        purchaseOrderId
    );

}


export async function getGoodsReceipts(
    businessId: string
) {

    return purchasesQueryService.getGoodsReceipts(
        businessId
    );

}


export async function getGoodsReceipt(
    goodsReceiptId: string
) {

    return purchasesQueryService.getGoodsReceipt(
        goodsReceiptId
    );

}


export async function getSupplierReturns(
    businessId: string
) {

    return purchasesQueryService.getSupplierReturns(
        businessId
    );

}


export async function getSupplierReturn(
    supplierReturnId: string
) {

    return purchasesQueryService.getSupplierReturn(
        supplierReturnId
    );

}