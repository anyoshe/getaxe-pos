"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { receiveStockAction } from "./receive-stock";

export async function commitOpeningStockImportAction(
  payloads: Array<Record<string, unknown>>,
) {
  await requireAuthorizedUser("stock_adjustments.create");

  if (!Array.isArray(payloads) || payloads.length === 0) {
    return {
      success: false as const,
      message: "Nothing to import.",
      results: [] as Array<{ index: number; success: boolean; message: string }>,
    };
  }
  if (payloads.length > 200) {
    return {
      success: false as const,
      message: "Maximum 200 rows per commit.",
      results: [],
    };
  }

  const results: Array<{ index: number; success: boolean; message: string }> =
    [];
  let ok = 0;

  for (let index = 0; index < payloads.length; index++) {
    const result = await receiveStockAction({
      ...payloads[index],
      movementType: "OPENING_STOCK",
    });
    if (result.success) {
      ok += 1;
      results.push({ index, success: true, message: "Received." });
    } else {
      results.push({
        index,
        success: false,
        message: result.message || "Failed.",
      });
    }
  }

  revalidatePath("/inventory/stock");
  revalidatePath("/inventory/stock/receive");
  revalidatePath("/inventory/batches");
  revalidatePath("/inventory/stock-movements");

  return {
    success: ok > 0,
    message:
      ok === payloads.length
        ? `${ok} opening stock line(s) received.`
        : `${ok} of ${payloads.length} line(s) received.`,
    results,
  };
}
