"use server";

import {
    salesQueryService,
} from "../services";

export async function getSales(
    businessId: string
) {

    return salesQueryService.getSales(
        businessId
    );

}


export async function getSale(
    saleId: string
) {

    return salesQueryService.getSale(
        saleId
    );

}