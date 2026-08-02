"use server";

import {
    productContextService,
} from "../services/product-context.service";


export async function getProductContext(
    businessId: string
) {

    return productContextService.getContext(
        businessId
    );

}