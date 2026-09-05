import { nowNairobiWallClock } from "@/lib/timezone";
import { salesStatusService } from "./sales-status.service";
import type { SalesUnitOfWork } from "./unit-of-work";
import type { PaymentInsert, ReversePaymentRequest } from "../types";

export class PaymentService {
  async recordPayments(
    uow: SalesUnitOfWork,
    saleId: string,
    payments: PaymentInsert[],
  ) {
    const sale = await uow.sales.findById(saleId);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    const recordedPayments = [];

    for (const payment of payments) {
      const createdPayment = await uow.payments.create({
        businessId: sale.businessId,
        saleId: sale.id,
        method: payment.method,
        status: payment.status ?? "COMPLETED",
        amount: payment.amount,
        receivedBy: payment.receivedBy,
        cashAccountId: payment.cashAccountId || null,
        transactionReference: payment.transactionReference || null,
        paidAt: payment.paidAt ?? nowNairobiWallClock(),
      } as any);

      recordedPayments.push(createdPayment);
    }

    const updatedSale = await this.updateSalePaymentStatus(uow, sale.id);

    return {
      sale: updatedSale,
      payments: recordedPayments,
    };
  }

  async recordPayment(request: {
    saleId: string;
    payments: PaymentInsert[];
  }) {
    const { Repository } = await import("@/repositories/base");
    const { SalesUnitOfWork } = await import("./unit-of-work");

    return Repository.withTransaction(async (tx) => {
      const uow = new SalesUnitOfWork(tx);
      return this.recordPayments(uow, request.saleId, request.payments);
    });
  }

  async reversePayment(
    uow: SalesUnitOfWork,
    request: ReversePaymentRequest,
  ) {
    const payment = await uow.payments.findById(request.paymentId);

    if (!payment) {
      throw new Error("Payment not found.");
    }

    if (payment.status === "REVERSED") {
      throw new Error("Payment has already been reversed.");
    }

    const reversal = await uow.paymentReversals.create({
      businessId: payment.businessId,
      paymentId: payment.id,
      reversedBy: request.reversedBy,
      reason: request.reason,
    });

    const updatedPayment = await uow.payments.update(payment.id, {
      status: "REVERSED",
    });

    const updatedSale = await this.updateSalePaymentStatus(
      uow,
      payment.saleId,
    );

    return {
      reversal,
      payment: updatedPayment,
      sale: updatedSale,
    };
  }

  async reversePaymentTransaction(request: ReversePaymentRequest) {
    const { Repository } = await import("@/repositories/base");
    const { SalesUnitOfWork } = await import("./unit-of-work");

    return Repository.withTransaction(async (tx) => {
      const uow = new SalesUnitOfWork(tx);
      return this.reversePayment(uow, request);
    });
  }

  private async updateSalePaymentStatus(
    uow: SalesUnitOfWork,
    saleId: string,
  ) {
    const sale = await uow.sales.findById(saleId);

    if (!sale) {
      throw new Error("Sale not found.");
    }

    const totalPaid = await uow.payments.getTotalPaid(sale.id);

    const status = salesStatusService.calculateStatus(
      Number(sale.total),
      totalPaid,
    );

    let paymentStatus: "PENDING" | "PARTIAL" | "COMPLETED" = "PENDING";
    if (totalPaid <= 0) paymentStatus = "PENDING";
    else if (totalPaid < Number(sale.total)) paymentStatus = "PARTIAL";
    else paymentStatus = "COMPLETED";

    return uow.sales.update(sale.id, {
      status,
      paymentStatus,
      amountPaid: totalPaid.toFixed(2),
      balanceDue: Math.max(0, Number(sale.total) - totalPaid).toFixed(2),
    });
  }
}

export const paymentService = new PaymentService();
