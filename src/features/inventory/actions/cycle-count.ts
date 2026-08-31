"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { stockCountsRepository } from "@/repositories/inventory/stock-counts.repository";
import { cycleCountService } from "../services/cycle-count.service";

async function requireCycleCountEnabled(businessId: string) {
  const caps = await new BusinessCapabilityRepository().listEnabled(businessId);
  if (!caps.includes("inventory.cycle-count")) {
    throw new Error(
      "Cycle count is not enabled for this business. Enable inventory.cycle-count under Settings → Capabilities.",
    );
  }
}

export async function listCycleCountsAction() {
  const user = await requireAuthorizedUser("stock_movements.view");
  await requireCycleCountEnabled(user.businessId).catch((e) => {
    throw e;
  });
  const rows = await stockCountsRepository.list(user.businessId);
  return { success: true as const, rows };
}

export async function getCycleCountAction(stockCountId: string) {
  const user = await requireAuthorizedUser("stock_movements.view");
  await requireCycleCountEnabled(user.businessId);
  const count = await stockCountsRepository.findById(
    stockCountId,
    user.businessId,
  );
  if (!count) {
    return { success: false as const, message: "Not found." };
  }
  const items = await stockCountsRepository.listItems(
    stockCountId,
    user.businessId,
  );
  return { success: true as const, count, items };
}

export async function startCycleCountAction(input: unknown) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  await requireCycleCountEnabled(user.businessId);

  const parsed = z
    .object({
      warehouseId: z.uuid(),
      reference: z.string().trim().nullable().optional(),
      notes: z.string().trim().nullable().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Select a warehouse." };
  }

  try {
    const count = await cycleCountService.startCount({
      businessId: user.businessId,
      userId: user.id,
      warehouseId: parsed.data.warehouseId,
      reference: parsed.data.reference,
      notes: parsed.data.notes,
    });
    revalidatePath("/inventory/cycle-counts");
    return {
      success: true as const,
      message: "Cycle count started. Enter physical counts.",
      id: count.id,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to start count.",
    };
  }
}

export async function saveCycleCountLineAction(input: unknown) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  await requireCycleCountEnabled(user.businessId);

  const parsed = z
    .object({
      itemId: z.uuid(),
      countedQuantity: z.coerce.number().min(0).nullable(),
      notes: z.string().trim().nullable().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid count value." };
  }

  try {
    await cycleCountService.saveLine({
      businessId: user.businessId,
      itemId: parsed.data.itemId,
      countedQuantity: parsed.data.countedQuantity,
      notes: parsed.data.notes,
    });
    return { success: true as const, message: "Saved." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Save failed.",
    };
  }
}

export async function completeCycleCountAction(stockCountId: string) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  await requireCycleCountEnabled(user.businessId);

  try {
    await cycleCountService.completeCount({
      businessId: user.businessId,
      userId: user.id,
      stockCountId,
    });
    revalidatePath("/inventory/cycle-counts");
    revalidatePath("/inventory/stock");
    revalidatePath("/inventory/stock-movements");
    revalidatePath("/inventory/adjustments");
    revalidatePath("/inventory/batches");
    return {
      success: true as const,
      message: "Cycle count completed. Variances posted to stock.",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Complete failed.",
    };
  }
}

export async function cancelCycleCountAction(stockCountId: string) {
  const user = await requireAuthorizedUser("stock_adjustments.create");
  await requireCycleCountEnabled(user.businessId);

  try {
    await cycleCountService.cancelCount(user.businessId, stockCountId);
    revalidatePath("/inventory/cycle-counts");
    return { success: true as const, message: "Cycle count cancelled." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Cancel failed.",
    };
  }
}
