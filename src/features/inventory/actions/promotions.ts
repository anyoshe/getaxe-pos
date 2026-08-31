"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { promotionsRepository } from "@/repositories/inventory/promotions.repository";

async function requirePromoCap(businessId: string) {
  const caps = await new BusinessCapabilityRepository().listEnabled(businessId);
  if (!caps.includes("inventory.promotional-pricing")) {
    throw new Error(
      "Promotional pricing is not enabled. Enable inventory.promotional-pricing under Capabilities.",
    );
  }
}

export async function listPromotionsAction() {
  const user = await requireAuthorizedUser("products.view");
  await requirePromoCap(user.businessId);
  const rows = await promotionsRepository.list(user.businessId);
  return { success: true as const, rows };
}

export async function createPromotionAction(input: unknown) {
  const user = await requireAuthorizedUser("products.update");
  await requirePromoCap(user.businessId);

  const parsed = z
    .object({
      code: z.string().trim().min(1).max(40),
      name: z.string().trim().min(1),
      description: z.string().trim().nullable().optional(),
      discountType: z.enum(["PERCENT_OFF", "AMOUNT_OFF", "FIXED_PRICE"]),
      discountValue: z.coerce.number().min(0),
      startsAt: z.string().nullable().optional(),
      endsAt: z.string().nullable().optional(),
      scope: z.enum(["ALL", "SELECTED"]),
      productIds: z.array(z.uuid()).optional().default([]),
      active: z.boolean().optional().default(true),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Check the form fields." };
  }

  const d = parsed.data;
  if (d.discountType === "PERCENT_OFF" && d.discountValue > 100) {
    return { success: false as const, message: "Percent cannot exceed 100." };
  }
  if (d.scope === "SELECTED" && d.productIds.length === 0) {
    return {
      success: false as const,
      message: "Select at least one product for a selected-scope promo.",
    };
  }

  try {
    await promotionsRepository.create({
      businessId: user.businessId,
      code: d.code,
      name: d.name,
      description: d.description,
      discountType: d.discountType,
      discountValue: String(d.discountValue),
      startsAt: d.startsAt ? new Date(d.startsAt) : null,
      endsAt: d.endsAt ? new Date(d.endsAt) : null,
      scope: d.scope,
      active: d.active,
      productIds: d.productIds,
    });
    revalidatePath("/inventory/promotions");
    revalidatePath("/sales/pos");
    return { success: true as const, message: "Promotion created." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Create failed.",
    };
  }
}

export async function togglePromotionAction(id: string, active: boolean) {
  const user = await requireAuthorizedUser("products.update");
  await requirePromoCap(user.businessId);
  await promotionsRepository.setActive(id, user.businessId, active);
  revalidatePath("/inventory/promotions");
  revalidatePath("/sales/pos");
  return {
    success: true as const,
    message: active ? "Promotion activated." : "Promotion deactivated.",
  };
}
