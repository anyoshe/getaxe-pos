"use server";

import {
    saleVoidService,
} from "../services";

import type {
    VoidSaleRequest,
} from "../types";


export async function voidSale(
    request: VoidSaleRequest
) {

    return saleVoidService.voidSaleTransaction(
        request
    );

}