"use server";

import {
    goodsReceiptService,
} from "../services";

import type {
    ReceiveGoodsRequest,
} from "../types";


export async function receiveGoods(
    request: ReceiveGoodsRequest
) {

    return goodsReceiptService.receiveGoods(
        request
    );

}