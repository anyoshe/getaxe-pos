"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { fxService } from "../services/fx.service";

export async function upsertExchangeRateAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      fromCurrency: z.string().min(3).max(8),
      toCurrency: z.string().min(3).max(8),
      rate: z.coerce.number().positive(),
      effectiveDate: z.string().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid rate." };
  }

  try {
    await fxService.upsertRate({
      businessId: user.businessId,
      fromCurrency: parsed.data.fromCurrency,
      toCurrency: parsed.data.toCurrency,
      rate: String(parsed.data.rate),
      effectiveDate: parsed.data.effectiveDate,
    });
    revalidatePath("/settings/currencies");
    return { success: true as const, message: "Exchange rate saved." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save rate.",
    };
  }
}

export async function convertAmountAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      amount: z.coerce.number(),
      fromCurrency: z.string().min(3),
      toCurrency: z.string().min(3),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid conversion." };
  }

  try {
    const result = await fxService.convert(
      user.businessId,
      parsed.data.amount,
      parsed.data.fromCurrency,
      parsed.data.toCurrency,
    );
    return { success: true as const, ...result };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Conversion failed.",
    };
  }
}
