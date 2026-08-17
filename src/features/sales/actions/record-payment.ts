"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { paymentService } from "../services";
import type { PaymentInsert } from "../types";

export async function recordPayment(
  saleId: string,
  payments: PaymentInsert[],
) {
  await requireAuthorizedUser("sales.payments.receive");

  return paymentService.recordPayment({
    saleId,
    payments,
  });
}