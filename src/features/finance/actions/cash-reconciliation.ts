"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { cashReconciliationService } from "../services/cash-reconciliation.service";

export async function getCashReconciliationSummaryAction(input: {
  cashAccountId: string;
  date: string;
}) {
  const user = await requireAuthorizedUser("accounts.view");
  try {
    const summary = await cashReconciliationService.computeDaySummary(
      user.businessId,
      input.cashAccountId,
      input.date,
    );
    return { success: true as const, summary };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load summary.",
    };
  }
}

export async function saveCashReconciliationAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = z
    .object({
      cashAccountId: z.uuid(),
      reconciliationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      countedBalance: z.coerce.number(),
      notes: z.string().nullable().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Check reconciliation details." };
  }

  try {
    const result = await cashReconciliationService.save({
      businessId: user.businessId,
      cashAccountId: parsed.data.cashAccountId,
      reconciliationDate: parsed.data.reconciliationDate,
      countedBalance: parsed.data.countedBalance,
      notes: parsed.data.notes ?? null,
      reconciledBy: user.id,
    });

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "CREATE",
      entity: "EXPENSE",
      entityId: result.row.id,
      description: `Cash reconciliation ${parsed.data.reconciliationDate} account ${parsed.data.cashAccountId} counted ${parsed.data.countedBalance} diff ${result.difference}`,
    });

    revalidatePath("/finance/reconciliation");
    return {
      success: true as const,
      message:
        Math.abs(result.difference) < 0.01
          ? "Reconciliation balanced."
          : `Saved with difference ${result.difference.toFixed(2)}.`,
      difference: result.difference,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save reconciliation.",
    };
  }
}
