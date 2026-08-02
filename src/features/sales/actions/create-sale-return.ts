"use server";

import {
    saleReturnService,
} from "../services";

import type {
    CreateSaleReturnRequest,
} from "../types";


export async function createSaleReturn(
    request: CreateSaleReturnRequest
) {

    return saleReturnService.createSaleReturn(
        request
    );

}