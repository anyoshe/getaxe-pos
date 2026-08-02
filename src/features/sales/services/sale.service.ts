import { Repository } from "@/repositories/base";

import {
    SalesUnitOfWork,
} from "./unit-of-work";

import {
    salesValidator,
} from "./sales-validator";

import {
    salesStockAllocationService,
} from "./sales-stock-allocation.service";

import type {
    CreateSaleRequest,
} from "../types";

import {
    salesStatusService,
} from "./sales-status.service";

import {
    paymentService,
} from "./payment.service";

export class SalesService {

    async createSale(
        request: CreateSaleRequest
    ) {

        salesValidator.validateCreateSale(
            request
        );

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new SalesUnitOfWork(tx);

                return this.createSaleWithUnitOfWork(
                    uow,
                    request
                );

            }
        );

    }


    async createSaleWithUnitOfWork(
        uow: SalesUnitOfWork,
        request: CreateSaleRequest
    ) {

        const sale =
            await uow.sales.create(
                request.sale
            );


        const items = [];


        for (const item of request.items) {

            const saleItem =
                await uow.saleItems.create({

                    ...item,

                    saleId:
                        sale.id,

                    businessId:
                        sale.businessId,

                });


            const allocations =
                await salesStockAllocationService.allocate(
                    uow,
                    {
                        productId:
                            saleItem.productId,

                        warehouseId:
                            sale.warehouseId,

                        quantity:
                            saleItem.quantity,

                        saleItemId:
                            saleItem.id,

                    }
                );


            for (const allocation of allocations) {

                const balance =
                    await uow.balances.findByBatchWarehouseForUpdate(
                        allocation.batchId,
                        allocation.warehouseId
                    );


                if (!balance) {

                    throw new Error(
                        "Inventory balance not found."
                    );

                }


                await uow.balances.decreaseQuantity(
                    balance.id,
                    allocation.quantity
                );


                await uow.batches.decreaseQuantity(
                    allocation.batchId,
                    allocation.quantity
                );


                await uow.movements.create({

                    businessId:
                        sale.businessId,

                    productId:
                        saleItem.productId,

                    batchId:
                        allocation.batchId,

                    warehouseId:
                        allocation.warehouseId,

                    userId:
                        sale.soldBy,

                    movementType:
                        "SALE",

                    quantity:
                        -allocation.quantity,

                    reference:
                        sale.invoiceNumber,

                    notes:
                        "Sale transaction",

                });

            }


            items.push(
                saleItem
            );

        }

        const paymentResult =
            await paymentService.recordPayments(
                uow,
                sale.id,
                request.payments
            );

        return {

            sale:
                paymentResult.sale,

            items,

            payments:
                paymentResult.payments,

        };

    }

    

}


export const salesService =
    new SalesService();