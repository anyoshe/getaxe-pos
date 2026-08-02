"use server";

import {
    supplierReturnService,
} from "../services";

import type {
    CreateSupplierReturnRequest,
} from "../types";


export async function createSupplierReturn(
    request: CreateSupplierReturnRequest
) {

    return supplierReturnService.create(
        request
    );

}