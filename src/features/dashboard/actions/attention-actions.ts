"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import {
  loadAttentionBundle,
  type AttentionKind,
} from "../services/attention.service";
import { adjustStockAction } from "@/features/inventory/actions/adjust-stock";
import { warehousesRepository } from "@/repositories/settings/warehouses.repository";

const kinds = [
  "restock",
  "expiry",
  "receivable",
  "payable",
  "slow",
  "expense",
] as const;

export async function getAttentionBundleAction(kind: string) {
  const user = await requireAuthorizedUser("dashboard.view");
  const k = (kinds.includes(kind as AttentionKind)
    ? kind
    : "restock") as AttentionKind;
  const data = await loadAttentionBundle(user.businessId, k);
  return { success: true as const, data };
}

const disposeSchema = z.object({
  batchId: z.uuid(),
  warehouseId: z.uuid(),
  quantity: z.coerce.number().positive(),
  notes: z.string().trim().optional(),
});

/** Write off remaining qty on an expiring batch (negative stock adjust). */
export async function disposeExpiringBatchAction(input: unknown) {
  await requireAuthorizedUser("stock_adjustments.create");
  const parsed = disposeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid dispose request." };
  }
  const { batchId, warehouseId, quantity, notes } = parsed.data;

  const res = await adjustStockAction({
    batchId,
    warehouseId,
    quantity: -Math.abs(quantity),
    notes:
      notes?.trim() ||
      "Expired / near-expiry stock written off from attention centre",
    reference: `EXP-DISP-${batchId.slice(0, 8)}`,
  });

  if (!res.success) {
    return { success: false as const, message: res.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attention");
  revalidatePath("/inventory/stock");
  revalidatePath("/inventory/batches");
  return { success: true as const, message: "Quantity written off from stock." };
}

export async function defaultWarehouseIdAction() {
  const user = await requireAuthorizedUser("dashboard.view");
  const list = await warehousesRepository
    .findAll(user.businessId)
    .catch(() => []);
  return list[0]?.id ?? null;
}
