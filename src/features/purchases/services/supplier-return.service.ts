import { Repository } from "@/repositories/base";

import {
    PurchasingUnitOfWork,
} from "./unit-of-work";

import {
    InventoryUnitOfWork,
} from "@/features/inventory/services/unit-of-work";

import {
    inventoryService,
} from "@/features/inventory/services/inventory.service";

import {
    purchasingValidator,
} from "./purchasing-validator";

import type {
    CreateSupplierReturnRequest,
    PostSupplierReturnRequest,
} from "../types";

export class SupplierReturnService {

    async create(
        request: CreateSupplierReturnRequest
    ) {

        purchasingValidator.validateCreateSupplierReturn(
            request
        );

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                const inventoryUow =
                    new InventoryUnitOfWork(tx);

                const supplierReturn =
                    await uow.supplierReturns.create(
                        request.supplierReturn
                    );

                for (const item of request.items) {

                    await uow.supplierReturnItems.create(
                        {
                            supplierReturnId:
                                supplierReturn.id,

                            productId:
                                item.productId,

                            productBatchId:
                                item.productBatchId,

                            quantity:
                                item.quantity,

                            unitCost:
                                item.unitCost,

                            total:
                                item.total,
                        }
                    );

                    await inventoryService.issueStockWithUnitOfWork(
                        inventoryUow,
                        {
                            batchId:
                                item.productBatchId!,

                            warehouseId:
                                item.warehouseId,

                            quantity:
                                item.quantity,

                            movement: {

                                businessId:
                                    supplierReturn.businessId,

                                productId:
                                    item.productId,

                                warehouseId:
                                    item.warehouseId,

                                movementType:
                                    "PURCHASE_RETURN",

                                quantity:
                                    -item.quantity,

                                reference:
                                    supplierReturn.returnNumber,

                                notes:
                                    "Supplier Return",

                                userId:
                                    supplierReturn.createdBy!,
                            },
                        }
                    );

                }

                return supplierReturn;

            }
        );

    }


    async post(
        request: PostSupplierReturnRequest
    ) {

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                return uow.supplierReturns.findById(
                    request.supplierReturnId
                );

            }
        );

    }

}

export const supplierReturnService =
    new SupplierReturnService();