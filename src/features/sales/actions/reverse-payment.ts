"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { paymentService } from "../services";
import type { ReversePaymentRequest } from "../types";

export async function reversePayment(request: ReversePaymentRequest) {
  await requireAuthorizedUser("sales.payments.reverse");

  return paymentService.reversePaymentTransaction(request);
}
