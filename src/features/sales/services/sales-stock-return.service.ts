import {
    SalesUnitOfWork,
} from "./unit-of-work";

export interface RestoreStockRequest {

    productId: string;

    batchId: string;

    warehouseId: string;

    businessId: string;

    quantity: number;

    userId: string;

    reference: string;

}

export class SalesStockReturnService {

    async restore(
    uow: SalesUnitOfWork,
    request: RestoreStockRequest,
) {

    const balance =
        await uow.balances.findByBatchWarehouse(
            request.batchId,
            request.warehouseId
        );

    if (!balance) {

        await uow.balances.create({

            businessId:
                request.businessId,

            productId:
                request.productId,

            batchId:
                request.batchId,

            warehouseId:
                request.warehouseId,

            quantity:
                request.quantity,

        });

    } else {

        await uow.balances.increaseQuantity(
            balance.id,
            request.quantity
        );

    }

    await uow.batches.increaseQuantity(
        request.batchId,
        request.quantity
    );

    await uow.movements.create({

        businessId:
            request.businessId,

        productId:
            request.productId,

        batchId:
            request.batchId,

        warehouseId:
            request.warehouseId,

        userId:
            request.userId,

        movementType:
            "SALE_RETURN",

        quantity:
            request.quantity,

        reference:
            request.reference,

        notes:
            "Sale return",

    });

}

}

export const salesStockReturnService =
    new SalesStockReturnService();