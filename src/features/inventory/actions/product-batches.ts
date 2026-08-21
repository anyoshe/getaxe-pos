"use server";

import { requireAuthorizedUser } from "@/lib/auth/authorize";

import {
  productBatchService,
} from "../services";

export async function getProductBatches(
  businessId: string
) {
  await requireAuthorizedUser(
    "product_batches.view"
  );

  return productBatchService.getProductBatches(
    businessId
  );
}

export async function getProductBatch(
  id: string
) {
  const user =
    await requireAuthorizedUser(
      "product_batches.view"
    );

  return productBatchService.getProductBatch(
    id,
    user.businessId
  );
}