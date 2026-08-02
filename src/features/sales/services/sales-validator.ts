import type {
    CreateSaleRequest,
    PostSaleRequest,
    RecordPaymentRequest,
    ReversePaymentRequest,
    CreateSaleReturnRequest,
    PostSaleReturnRequest,
} from "../types";

export class SalesValidator {

    validateCreateSale(
        request: CreateSaleRequest
    ) {

        if (!request.sale.businessId) {
            throw new Error(
                "Business is required."
            );
        }

        if (!request.sale.branchId) {
            throw new Error(
                "Branch is required."
            );
        }

        if (!request.sale.warehouseId) {
            throw new Error(
                "Warehouse is required."
            );
        }

        if (!request.sale.soldBy) {
            throw new Error(
                "Sales user is required."
            );
        }

        if (request.items.length === 0) {
            throw new Error(
                "Sale must contain at least one item."
            );
        }

        for (const item of request.items) {

            if (!item.productId) {
                throw new Error(
                    "Product is required."
                );
            }

            if (item.quantity <= 0) {
                throw new Error(
                    "Quantity must be greater than zero."
                );
            }

        }

    }


    validatePostSale(
        request: PostSaleRequest
    ) {

        if (!request.saleId) {
            throw new Error(
                "Sale is required."
            );
        }

    }


    validateRecordPayment(
        request: RecordPaymentRequest
    ) {

        if (!request.payment.businessId) {
            throw new Error(
                "Business is required."
            );
        }

        if (!request.payment.saleId) {
            throw new Error(
                "Sale is required."
            );
        }

        if (!request.payment.receivedBy) {
            throw new Error(
                "Cashier is required."
            );
        }

        if (
            Number(
                request.payment.amount
            ) <= 0
        ) {
            throw new Error(
                "Payment amount must be greater than zero."
            );
        }

    }


    validateReversePayment(
        request: ReversePaymentRequest
    ) {

        if (!request.paymentId) {
            throw new Error(
                "Payment is required."
            );
        }

        if (!request.reversedBy) {
            throw new Error(
                "User is required."
            );
        }

        if (!request.reason) {
            throw new Error(
                "Reason is required."
            );
        }

    }


    validateCreateSaleReturn(
        request: CreateSaleReturnRequest
    ) {

        if (!request.saleReturn.businessId) {
            throw new Error(
                "Business is required."
            );
        }

        if (!request.saleReturn.saleId) {
            throw new Error(
                "Sale is required."
            );
        }

        if (!request.saleReturn.createdBy) {
            throw new Error(
                "User is required."
            );
        }

        if (request.items.length === 0) {
            throw new Error(
                "Sale return must contain at least one item."
            );
        }

        for (const item of request.items) {

            if (!item.saleItemId) {
                throw new Error(
                    "Sale item is required."
                );
            }

            if (!item.productBatchId) {
                throw new Error(
                    "Product batch is required."
                );
            }

            if (!item.warehouseId) {
                throw new Error(
                    "Warehouse is required."
                );
            }

            if (item.quantity <= 0) {
                throw new Error(
                    "Return quantity must be greater than zero."
                );
            }

        }

    }


    validatePostSaleReturn(
        request: PostSaleReturnRequest
    ) {

        if (!request.saleReturnId) {
            throw new Error(
                "Sale return is required."
            );
        }

    }

}

export const salesValidator =
    new SalesValidator();