"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasPermission } from "@/lib/auth/permissions";
import { loyaltyService } from "../services/loyalty.service";

async function requireLoyaltyUser() {
  try {
    return await requireAuthorizedUser("loyalty.manage");
  } catch {
    try {
      return await requireAuthorizedUser("customers.update");
    } catch {
      return await requireAuthorizedUser("customers.view");
    }
  }
}

export async function updateLoyaltyProgramAction(input: unknown) {
  const user = await requireLoyaltyUser();
  const parsed = z
    .object({
      name: z.string().min(1),
      pointsPerAmount: z.coerce.number().positive(),
      amountPerPointUnit: z.coerce.number().positive(),
      redemptionValuePerPoint: z.coerce.number().positive(),
      minRedeemPoints: z.coerce.number().int().min(0),
      active: z.boolean(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Check loyalty program fields." };
  }

  try {
    await loyaltyService.updateProgram(user.businessId, {
      name: parsed.data.name,
      pointsPerAmount: String(parsed.data.pointsPerAmount),
      amountPerPointUnit: String(parsed.data.amountPerPointUnit),
      redemptionValuePerPoint: String(parsed.data.redemptionValuePerPoint),
      minRedeemPoints: parsed.data.minRedeemPoints,
      active: parsed.data.active,
    });
    revalidatePath("/customers");
    revalidatePath("/customers/loyalty");
    return { success: true as const, message: "Loyalty program saved." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save program.",
    };
  }
}

export async function adjustCustomerLoyaltyAction(input: unknown) {
  const user = await requireLoyaltyUser();
  const parsed = z
    .object({
      customerId: z.uuid(),
      points: z.coerce.number().int(),
      type: z.enum(["EARN", "REDEEM", "ADJUST", "BONUS"]),
      notes: z.string().nullable().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid loyalty adjustment." };
  }

  // REDEEM expects positive points in UI → store as negative
  let delta = parsed.data.points;
  if (parsed.data.type === "REDEEM" && delta > 0) delta = -delta;
  if (parsed.data.type === "ADJUST") {
    // keep signed as entered
  }

  try {
    const result = await loyaltyService.adjustPoints({
      businessId: user.businessId,
      customerId: parsed.data.customerId,
      points: delta,
      type: parsed.data.type,
      notes: parsed.data.notes ?? null,
      createdBy: user.id,
    });
    revalidatePath("/customers");
    revalidatePath("/customers/loyalty");
    return {
      success: true as const,
      message: `Balance is now ${result.balance} points.`,
      balance: result.balance,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Adjustment failed.",
    };
  }
}
