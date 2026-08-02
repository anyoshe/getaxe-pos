import { Repository } from "@/repositories/base";

import {
  PurchasingUnitOfWork,
} from "./unit-of-work";

import {
  purchasingValidator,
} from "./purchasing-validator";

import type {
  CreatePurchaseOrderRequest,
  ApprovePurchaseOrderRequest,
} from "../types";

export class PurchaseOrderService {

  async createPurchaseOrder(
    request: CreatePurchaseOrderRequest
  ) {

    purchasingValidator.validateCreatePurchaseOrder(
      request
    );

    return Repository.withTransaction(
      async (tx) => {

        const uow =
          new PurchasingUnitOfWork(tx);

        const order =
          await uow.purchaseOrders.create(
            request.order
          );

        const items = [];

        for (const item of request.items) {

          const createdItem =
            await uow.purchaseOrderItems.create({
              ...item,
              purchaseOrderId: order.id,
            });

          items.push(createdItem);

        }

        return {
          order,
          items,
        };

      }
    );

  }

  async approvePurchaseOrder(
    request: ApprovePurchaseOrderRequest
  ) {

    purchasingValidator.validateApprovePurchaseOrder(
      request
    );

    return Repository.withTransaction(
      async (tx) => {

        const uow =
          new PurchasingUnitOfWork(tx);

        const order =
          await uow.purchaseOrders.findById(
            request.purchaseOrderId
          );

        if (!order) {
          throw new Error(
            "Purchase order not found."
          );
        }

        if (order.status !== "DRAFT") {
          throw new Error(
            "Only draft purchase orders can be approved."
          );
        }

        const approvedOrder =
          await uow.purchaseOrders.update(
            request.purchaseOrderId,
            {
              status: "APPROVED",
              approvedBy: request.approvedBy,
              approvedAt: new Date(),
            }
          );

        return approvedOrder;

      }
    );

  }

  async cancelPurchaseOrder(
    purchaseOrderId: string
  ) {

    return Repository.withTransaction(
      async (tx) => {

        const uow =
          new PurchasingUnitOfWork(tx);

        const order =
          await uow.purchaseOrders.findById(
            purchaseOrderId
          );

        if (!order) {
          throw new Error(
            "Purchase order not found."
          );
        }

        if (order.status !== "DRAFT") {
          throw new Error(
            "Only draft purchase orders can be cancelled."
          );
        }

        return uow.purchaseOrders.update(
          purchaseOrderId,
          {
            status: "CANCELLED",
          }
        );

      }
    );

  }

}

export const purchaseOrderService =
  new PurchaseOrderService();