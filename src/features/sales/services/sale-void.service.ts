import {
    paymentService,
} from "./payment.service";

import {
    salesStockReturnService,
} from "./sales-stock-return.service";

import {
    SalesUnitOfWork,
} from "./unit-of-work";

import type {
    VoidSaleRequest,
} from "../types";

import {
    Repository,
} from "@/repositories/base";


export class SaleVoidService {

    async voidSaleTransaction(
        request: VoidSaleRequest
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new SalesUnitOfWork(tx);

                return this.voidSale(
                    uow,
                    request
                );

            }
        );

    }

    async voidSale(
        uow: SalesUnitOfWork,
        request: VoidSaleRequest,
    ) {

        const sale =
            await uow.sales.findById(
                request.saleId
            );

        if (!sale) {

            throw new Error(
                "Sale not found."
            );

        }

        if (
            sale.status ===
            "VOIDED"
        ) {

            throw new Error(
                "Sale has already been voided."
            );

        }

        const saleItems =
            await uow.saleItems.findBySale(
                sale.id
            );

        for (const item of saleItems) {

            for (const allocation of item.batches) {

                await salesStockReturnService.restore(
                    uow,
                    {

                        businessId:
                            sale.businessId,

                        productId:
                            item.productId,

                        batchId:
                            allocation.productBatchId,

                        warehouseId:
                            sale.warehouseId,

                        quantity:
                            allocation.quantity,

                        userId:
                            request.voidedBy,

                        reference:
                            sale.invoiceNumber,

                    }
                );

            }

        }

        const payments =
            await uow.payments.findCompletedBySale(
                sale.id
            );

        for (const payment of payments) {

            await paymentService.reversePayment(
                uow,
                {

                    paymentId:
                        payment.id,

                    reversedBy:
                        request.voidedBy,

                    reason:
                        "Sale voided",

                }
            );

        }
        const updatedSale =
            await uow.sales.update(
                sale.id,
                {
                    status:
                        "VOIDED",
                }
            );

        return updatedSale;

    }

}

export const saleVoidService =
    new SaleVoidService();