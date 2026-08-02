"use server";

import {
    supplierReturnService,
} from "../services";

import type {
    PostSupplierReturnRequest,
} from "../types";


export async function postSupplierReturn(
    request: PostSupplierReturnRequest
) {

    return supplierReturnService.post(
        request
    );

}