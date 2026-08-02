"use server";

import {
    salesService,
} from "../services";

import type {
    CreateSaleRequest,
} from "../types";


export async function createSale(
    request: CreateSaleRequest
) {

    return salesService.createSale(
        request
    );

}