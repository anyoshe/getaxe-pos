import {
    SalesUnitOfWork,
} from "./unit-of-work";

import {
    salesStockReturnService,
} from "./sales-stock-return.service";

import type {
    CreateSaleReturnItemRequest,
} from "../types";

export class SaleReturnItemService {

    async create(
        uow: SalesUnitOfWork,
        saleReturn: {
            id: string;
            businessId: string;
            createdBy: string;
            returnNumber: string;
        },
        item: CreateSaleReturnItemRequest,
    ) {

        const returnItem =
            await uow.saleReturnItems.create({

                saleReturnId:
                    saleReturn.id,

                saleItemId:
                    item.saleItemId,

                productBatchId:
                    item.productBatchId,

                quantity:
                    item.quantity,

                unitPrice:
                    item.unitPrice,

                total:
                    item.total,

            });

        await salesStockReturnService.restore(
            uow,
            {

                businessId:
                    saleReturn.businessId,

                productId:
                    item.productId,

                batchId:
                    item.productBatchId!,

                warehouseId:
                    item.warehouseId,

                quantity:
                    item.quantity,

                userId:
                    saleReturn.createdBy,

                reference:
                    saleReturn.returnNumber,

            }
        );

        return returnItem;

    }

}

export const saleReturnItemService =
    new SaleReturnItemService();