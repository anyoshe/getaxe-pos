"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { businesses } from "@/db/schema/core/businesses";
import { businessSettings } from "@/db/schema/settings/business_settings";
import { numberingSequences } from "@/db/schema/settings/numbering_sequences";
import { paymentMethods } from "@/db/schema/settings/payment_methods";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { businessSettingsRepository } from "@/repositories/settings/business-settings.repository";
import { numberingSequencesService } from "../services/numbering-sequences.service";
import { branchesRepository } from "@/repositories/settings/branches.repository";

export async function updateBusinessProfileAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      name: z.string().min(1),
      legalName: z.string().nullable().optional(),
      registrationNumber: z.string().nullable().optional(),
      kraPin: z.string().nullable().optional(),
      email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
      phone: z.string().nullable().optional(),
      website: z.string().nullable().optional(),
      county: z.string().nullable().optional(),
      town: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      currency: z.string().min(1).optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Check business profile fields." };
  }

  try {
    const data = parsed.data;
    await db
      .update(businesses)
      .set({
        name: data.name,
        legalName: data.legalName || null,
        registrationNumber: data.registrationNumber || null,
        kraPin: data.kraPin || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        county: data.county || null,
        town: data.town || null,
        address: data.address || null,
        currency: data.currency || "KES",
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, user.businessId));

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "UPDATE",
      entity: "BUSINESS",
      entityId: user.businessId,
      description: `Business profile updated: ${data.name}`,
    });

    revalidatePath("/settings/business");
    revalidatePath("/settings");
    return { success: true as const, message: "Business profile saved." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save profile.",
    };
  }
}

export async function updateBusinessSettingsAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      allowNegativeStock: z.boolean(),
      trackInventoryByBatch: z.boolean(),
      enableExpiryTracking: z.boolean(),
      requireCustomerOnSale: z.boolean(),
      requireSupplierOnPurchase: z.boolean(),
      allowBackdatedTransactions: z.boolean(),
      autoPostJournals: z.boolean(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid settings." };
  }

  try {
    const existing = await businessSettingsRepository.findByBusinessId(
      user.businessId,
    );
    if (existing) {
      await businessSettingsRepository.update(user.businessId, {
        ...parsed.data,
        updatedAt: new Date(),
      });
    } else {
      await db.insert(businessSettings).values({
        businessId: user.businessId,
        ...parsed.data,
      });
    }

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "UPDATE",
      entity: "SETTING",
      description: "Operational business settings updated",
    });

    revalidatePath("/settings/business");
    return { success: true as const, message: "Settings saved." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to save settings.",
    };
  }
}

export async function ensureNumberingSequencesAction() {
  const user = await requireAuthorizedUser("numbering_sequences.view");
  const branches = await branchesRepository.findAll(user.businessId);
  const branch = branches.find((b) => b.isHeadOffice) ?? branches[0];
  if (!branch) {
    return { success: false as const, message: "Create a branch first." };
  }
  await numberingSequencesService.createDefaultSequences(
    user.businessId,
    branch.id,
  );
  revalidatePath("/settings/numbering");
  return { success: true as const, message: "Default sequences ensured." };
}

export async function updateNumberingSequenceAction(input: unknown) {
  const user = await requireAuthorizedUser("numbering_sequences.view");
  const parsed = z
    .object({
      id: z.uuid(),
      prefix: z.string().min(1).max(20),
      nextNumber: z.coerce.number().int().min(1),
      numberLength: z.coerce.number().int().min(1).max(12),
      separator: z.string().max(5).optional(),
      active: z.boolean().optional(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid sequence." };
  }

  try {
    await db
      .update(numberingSequences)
      .set({
        prefix: parsed.data.prefix,
        nextNumber: parsed.data.nextNumber,
        numberLength: parsed.data.numberLength,
        separator: parsed.data.separator ?? "-",
        active: parsed.data.active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(numberingSequences.id, parsed.data.id));

    revalidatePath("/settings/numbering");
    return { success: true as const, message: "Sequence updated." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Update failed.",
    };
  }
}

export async function createPaymentMethodAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      code: z.string().min(1).max(30),
      name: z.string().min(1),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid payment method." };
  }

  try {
    await db.insert(paymentMethods).values({
      businessId: user.businessId,
      code: parsed.data.code.toUpperCase(),
      name: parsed.data.name,
      active: true,
    });
    revalidatePath("/settings/payment-methods");
    return { success: true as const, message: "Payment method added." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not add method.",
    };
  }
}


const MAX_LOGO_BYTES = 600_000; // ~600KB after base64

export async function uploadBusinessLogoAction(formData: FormData) {
  const user = await requireAuthorizedUser("business.view");
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false as const, message: "Choose an image file (PNG or JPG)." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return {
      success: false as const,
      message: "Logo is too large. Use an image under 500 KB.",
    };
  }
  const type = file.type || "image/png";
  if (!type.startsWith("image/")) {
    return { success: false as const, message: "Only image files are allowed." };
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${type};base64,${buf.toString("base64")}`;
    await db
      .update(businesses)
      .set({ logo: dataUrl, updatedAt: new Date() })
      .where(eq(businesses.id, user.businessId));

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "UPDATE",
      entity: "BUSINESS",
      entityId: user.businessId,
      description: "Business logo updated for receipts",
    });

    revalidatePath("/settings/business");
    revalidatePath("/sales/pos");
    revalidatePath("/sales/invoices");
    return { success: true as const, message: "Logo saved. It will appear on receipts." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to upload logo.",
    };
  }
}

export async function removeBusinessLogoAction() {
  const user = await requireAuthorizedUser("business.view");
  try {
    await db
      .update(businesses)
      .set({ logo: null, updatedAt: new Date() })
      .where(eq(businesses.id, user.businessId));
    revalidatePath("/settings/business");
    revalidatePath("/sales/pos");
    revalidatePath("/sales/invoices");
    return { success: true as const, message: "Logo removed." };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to remove logo.",
    };
  }
}

