import {
    Repository,
} from "@/repositories/base";

import {
    PurchasingUnitOfWork,
} from "./unit-of-work";


export class PurchasesQueryService {


    async getPurchaseOrders(
        businessId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.purchaseOrders.findAll(
                    businessId
                );

            }
        );

    }


    async getPurchaseOrder(
        purchaseOrderId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.purchaseOrders.findById(
                    purchaseOrderId
                );

            }
        );

    }


    async getGoodsReceipts(
        businessId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.goodsReceipts.findAll(
                    businessId
                );

            }
        );

    }


    async getGoodsReceipt(
        goodsReceiptId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.goodsReceipts.findById(
                    goodsReceiptId
                );

            }
        );

    }


    async getSupplierReturns(
        businessId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.supplierReturns.findAll(
                    businessId
                );

            }
        );

    }


    async getSupplierReturn(
        supplierReturnId: string
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.supplierReturns.findById(
                    supplierReturnId
                );

            }
        );

    }


}


export const purchasesQueryService =
    new PurchasesQueryService();