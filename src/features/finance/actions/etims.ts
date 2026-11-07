"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { etimsSettings } from "@/db/schema/integrations/etims";
import { requireAuthorizedUser } from "@/lib/auth/authorize";

export async function getEtimsSettingsAction() {
  const user = await requireAuthorizedUser("accounts.view");
  const [row] = await db
    .select()
    .from(etimsSettings)
    .where(eq(etimsSettings.businessId, user.businessId))
    .limit(1);

  if (!row) {
    return {
      success: true as const,
      settings: {
        enabled: false,
        environment: "simulation" as const,
        kraPin: "",
        branchId: "",
        deviceSerial: "",
        notes: "",
      },
    };
  }

  return {
    success: true as const,
    settings: {
      enabled: row.enabled,
      environment:
        row.environment === "production"
          ? ("production" as const)
          : row.environment === "sandbox"
            ? ("sandbox" as const)
            : ("simulation" as const),
      kraPin: row.kraPin || "",
      branchId: row.branchId || "",
      deviceSerial: row.deviceSerial || "",
      notes: row.notes || "",
    },
  };
}

const saveSchema = z.object({
  enabled: z.boolean(),
  environment: z.enum(["simulation", "sandbox", "production"]),
  kraPin: z.string().max(32).optional().nullable(),
  branchId: z.string().max(64).optional().nullable(),
  deviceSerial: z.string().max(128).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function saveEtimsSettingsAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Invalid eTIMS settings." };
  }
  const data = parsed.data;
  const now = new Date();

  const [existing] = await db
    .select({ id: etimsSettings.id })
    .from(etimsSettings)
    .where(eq(etimsSettings.businessId, user.businessId))
    .limit(1);

  const values = {
    enabled: data.enabled,
    environment: data.environment,
    kraPin: data.kraPin?.trim() || null,
    branchId: data.branchId?.trim() || null,
    deviceSerial: data.deviceSerial?.trim() || null,
    notes: data.notes?.trim() || null,
    updatedAt: now,
  };

  if (existing) {
    await db
      .update(etimsSettings)
      .set(values)
      .where(eq(etimsSettings.id, existing.id));
  } else {
    await db.insert(etimsSettings).values({
      businessId: user.businessId,
      ...values,
      createdAt: now,
    });
  }

  revalidatePath("/settings/etims");
  revalidatePath("/settings/compliance");
  return {
    success: true as const,
    message: data.enabled
      ? data.environment === "simulation"
        ? "eTIMS enabled in simulation mode."
        : "eTIMS enabled. Live KRA posting requires Phase B credentials."
      : "eTIMS disabled — sales use normal receipts only.",
  };
}
