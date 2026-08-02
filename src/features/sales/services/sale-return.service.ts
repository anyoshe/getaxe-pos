import { Repository } from "@/repositories/base";

import {
    SalesUnitOfWork,
} from "./unit-of-work";

import {
    salesValidator,
} from "./sales-validator";

import type {
    CreateSaleReturnRequest,
} from "../types";


import {
    saleReturnItemService,
} from "./sale-return-item.service";

export class SaleReturnService {

    async createSaleReturn(
        request: CreateSaleReturnRequest
    ) {

        salesValidator.validateCreateSaleReturn(
            request
        );

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new SalesUnitOfWork(tx);

                return this.createSaleReturnWithUnitOfWork(
                    uow,
                    request
                );

            }
        );

    }

    async createSaleReturnWithUnitOfWork(
        uow: SalesUnitOfWork,
        request: CreateSaleReturnRequest
    ) {

        const saleReturn =
            await uow.saleReturns.create(
                request.saleReturn
            );

        const items = [];

        for (const item of request.items) {

            const returnItem =
                await saleReturnItemService.create(
                    uow,
                    saleReturn,
                    item
                );

            items.push(
                returnItem
            );

        }
        return {

            saleReturn,

            items,

        };

    }

}

export const saleReturnService =
    new SaleReturnService();