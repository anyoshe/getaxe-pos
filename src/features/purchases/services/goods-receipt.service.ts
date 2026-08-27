import { qtyStr } from "@/lib/quantity";
import { Repository } from "@/repositories/base";

import {
    PurchasingUnitOfWork,
} from "./unit-of-work";

import {
    purchasingValidator,
} from "./purchasing-validator";

import {
    inventoryService,
} from "@/features/inventory/services";

import type {
    ReceiveGoodsRequest,
    PostGoodsReceiptRequest,
} from "../types";

import {
    InventoryUnitOfWork,
} from "@/features/inventory/services/unit-of-work";

export class GoodsReceiptService {

    async receiveGoods(
        request: ReceiveGoodsRequest
    ) {

        purchasingValidator.validateReceiveGoods(
            request
        );

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                const inventoryUow =
                    new InventoryUnitOfWork(tx);

                const receipt =
                    await uow.goodsReceipts.create(
                        request.receipt
                    );

                const receiptItems = [];

                for (const item of request.items) {

                    const receiptItem =
                        await uow.goodsReceiptItems.create({
                            ...item,
                            goodsReceiptId: receipt.id,
                        });

                    receiptItems.push(
                        receiptItem
                    );

                    await inventoryService.receiveStockWithUnitOfWork(
                        inventoryUow,
                        {
                            warehouseId:
                                request.warehouseId,

                            batch: {
                                businessId:
                                    receipt.businessId,

                                productId:
                                    item.productId,

                                supplierId:
                                    receipt.supplierId,

                                batchNumber:
                                    item.batchNumber ?? "",

                                expiryDate:
                                    item.expiryDate ?? null,

                                quantityReceived: qtyStr(item.quantity),

                                quantityRemaining: qtyStr(item.quantity),

                                costPrice:
                                    item.unitCost,
                            },

                            movement: {
                                businessId:
                                    receipt.businessId,

                                productId:
                                    item.productId,

                                warehouseId:
                                    request.warehouseId,

                                movementType:
                                    "PURCHASE",

                                quantity: qtyStr(item.quantity),

                                reference:
                                    receipt.receiptNumber,

                                notes:
                                    receipt.notes,

                                userId:
                                    receipt.receivedBy,
                            },
                        }
                    );

                    if (
                        receipt.purchaseOrderId
                    ) {

                        const poItem =
                            await uow.purchaseOrderItems.findByPurchaseOrderAndProduct(
                                receipt.purchaseOrderId,
                                item.productId
                            );

                        if (poItem) {

                            await uow.purchaseOrderItems.update(
                                poItem.id,
                                {
                                    receivedQuantity:
                                        poItem.receivedQuantity +
                                        item.quantity,
                                }
                            );

                        }

                    }

                }

                return {
                    receipt,
                    items:
                        receiptItems,
                };

            }
        );

    }

    async postGoodsReceipt(
        request: PostGoodsReceiptRequest
    ) {

        purchasingValidator.validatePostGoodsReceipt(
            request
        );

        return Repository.withTransaction(
            async (tx) => {

                const uow =
                    new PurchasingUnitOfWork(tx);

                const receipt =
                    await uow.goodsReceipts.findById(
                        request.goodsReceiptId
                    );

                if (!receipt) {

                    throw new Error(
                        "Goods receipt not found."
                    );

                }

                if (
                    receipt.status !==
                    "DRAFT"
                ) {

                    throw new Error(
                        "Only draft goods receipts can be posted."
                    );

                }

                return uow.goodsReceipts.updateStatus(
                    receipt.id,
                    "POSTED"
                );

            }
        );

    }

}

export const goodsReceiptService =
    new GoodsReceiptService();