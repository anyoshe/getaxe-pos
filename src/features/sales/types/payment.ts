import type {
  InferInsertModel,
} from "drizzle-orm";

import {
  payments,
} from "@/db/schema/sales/payments";

export type PaymentInsert =
  InferInsertModel<typeof payments>;

export interface RecordPaymentRequest {

  payment: PaymentInsert;

}

export interface ReversePaymentRequest {

  paymentId: string;

  reversedBy: string;

  reason: string;

}