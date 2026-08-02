"use server";

import {
    goodsReceiptService,
} from "../services";

import type {
    PostGoodsReceiptRequest,
} from "../types";


export async function postGoodsReceipt(
    request: PostGoodsReceiptRequest
) {

    return goodsReceiptService.postGoodsReceipt(
        request
    );

}