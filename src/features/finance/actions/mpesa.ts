"use server";

import { and, eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { mpesaSettings, mpesaStkRequests } from "@/db/schema/integrations/mpesa";
import { requireAuthorizedUser } from "@/lib/auth/authorize";
import {
  normalizeMpesaPhone,
  stkPush,
  stkQuery,
  type MpesaConfig,
} from "@/features/finance/services/mpesa-daraja.service";

function toConfig(row: typeof mpesaSettings.$inferSelect): MpesaConfig {
  return {
    environment: (row.environment === "production" ? "production" : "sandbox") as
      | "sandbox"
      | "production",
    consumerKey: row.consumerKey || "",
    consumerSecret: row.consumerSecret || "",
    passkey: row.passkey || "",
    shortcode: row.shortcode || "",
    shortcodeType: (row.shortcodeType === "PAYBILL" ? "PAYBILL" : "TILL") as
      | "TILL"
      | "PAYBILL",
    accountReference: row.accountReference,
    transactionDesc: row.transactionDesc,
    simulationMode: row.simulationMode !== false || !row.consumerKey,
  };
}

export async function getMpesaSettingsAction() {
  const user = await requireAuthorizedUser("accounts.view");
  const [row] = await db
    .select()
    .from(mpesaSettings)
    .where(eq(mpesaSettings.businessId, user.businessId))
    .limit(1);
  if (!row) {
    return {
      success: true as const,
      settings: {
        enabled: false,
        environment: "sandbox" as const,
        shortcodeType: "TILL" as const,
        shortcode: "",
        accountReference: "GetAxe",
        transactionDesc: "POS Sale",
        simulationMode: true,
        hasCredentials: false,
      },
    };
  }
  return {
    success: true as const,
    settings: {
      enabled: row.enabled,
      environment: row.environment === "production" ? "production" : "sandbox",
      shortcodeType: row.shortcodeType === "PAYBILL" ? "PAYBILL" : "TILL",
      shortcode: row.shortcode || "",
      accountReference: row.accountReference || "GetAxe",
      transactionDesc: row.transactionDesc || "POS Sale",
      simulationMode: row.simulationMode,
      hasCredentials: Boolean(row.consumerKey && row.consumerSecret && row.passkey),
      // never return secrets to client beyond presence
    },
  };
}

const saveSchema = z.object({
  enabled: z.boolean(),
  environment: z.enum(["sandbox", "production"]),
  shortcodeType: z.enum(["TILL", "PAYBILL"]),
  shortcode: z.string().max(20).optional().nullable(),
  accountReference: z.string().max(12).optional().nullable(),
  transactionDesc: z.string().max(20).optional().nullable(),
  simulationMode: z.boolean(),
  consumerKey: z.string().max(200).optional().nullable(),
  consumerSecret: z.string().max(200).optional().nullable(),
  passkey: z.string().max(200).optional().nullable(),
  /** If false, leave existing secrets unchanged when empty */
  updateSecrets: z.boolean().optional(),
});

export async function saveMpesaSettingsAction(input: unknown) {
  const user = await requireAuthorizedUser("accounts.update");
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Check M-Pesa settings." };
  }
  const d = parsed.data;
  const [existing] = await db
    .select()
    .from(mpesaSettings)
    .where(eq(mpesaSettings.businessId, user.businessId))
    .limit(1);

  const secrets = {
    consumerKey:
      d.updateSecrets && d.consumerKey
        ? d.consumerKey.trim()
        : existing?.consumerKey ?? (d.consumerKey?.trim() || null),
    consumerSecret:
      d.updateSecrets && d.consumerSecret
        ? d.consumerSecret.trim()
        : existing?.consumerSecret ?? (d.consumerSecret?.trim() || null),
    passkey:
      d.updateSecrets && d.passkey
        ? d.passkey.trim()
        : existing?.passkey ?? (d.passkey?.trim() || null),
  };

  const values = {
    businessId: user.businessId,
    enabled: d.enabled,
    environment: d.environment,
    shortcodeType: d.shortcodeType,
    shortcode: d.shortcode?.trim() || null,
    accountReference: d.accountReference?.trim() || "GetAxe",
    transactionDesc: d.transactionDesc?.trim() || "POS Sale",
    simulationMode: d.simulationMode,
    ...secrets,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(mpesaSettings)
      .set(values)
      .where(eq(mpesaSettings.id, existing.id));
  } else {
    await db.insert(mpesaSettings).values(values);
  }
  revalidatePath("/settings/mpesa");
  revalidatePath("/sales/pos");
  return { success: true as const, message: "M-Pesa settings saved." };
}

const stkSchema = z.object({
  phone: z.string().min(9).max(15),
  amount: z.coerce.number().positive(),
  cashAccountId: z.string().uuid().optional().nullable(),
});

export async function initiateMpesaStkAction(input: unknown) {
  const user = await requireAuthorizedUser("sales.create");
  const parsed = stkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, message: "Phone and amount are required." };
  }
  const phone = normalizeMpesaPhone(parsed.data.phone);
  if (!phone) {
    return {
      success: false as const,
      message: "Invalid phone. Use 07XX… or 2547XX…",
    };
  }

  const [settings] = await db
    .select()
    .from(mpesaSettings)
    .where(eq(mpesaSettings.businessId, user.businessId))
    .limit(1);

  if (!settings?.enabled) {
    return {
      success: false as const,
      message:
        "M-Pesa STK is not enabled. Open Settings → M-Pesa and enable integration (simulation is fine for testing).",
    };
  }

  const cfg = toConfig(settings);
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  const base = origin.startsWith("http") ? origin : `https://${origin}`;
  const callbackUrl = `${base.replace(/\/$/, "")}/api/mpesa/callback`;

  try {
    const push = await stkPush(cfg, {
      phone,
      amount: parsed.data.amount,
      callbackUrl,
      accountReference: settings.accountReference || undefined,
    });

    const [row] = await db
      .insert(mpesaStkRequests)
      .values({
        businessId: user.businessId,
        checkoutRequestId: push.checkoutRequestId,
        merchantRequestId: push.merchantRequestId,
        phone,
        amount: parsed.data.amount.toFixed(2),
        status: "PENDING",
        cashAccountId: parsed.data.cashAccountId || null,
        createdBy: user.id,
      })
      .returning();

    return {
      success: true as const,
      requestId: row.id,
      checkoutRequestId: push.checkoutRequestId,
      simulated: Boolean(push.simulated),
      message:
        push.customerMessage ||
        "STK prompt sent. Ask the customer to enter their M-Pesa PIN.",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "STK push failed.",
    };
  }
}

export async function queryMpesaStkAction(input: {
  requestId?: string;
  checkoutRequestId?: string;
}) {
  const user = await requireAuthorizedUser("sales.create");
  let row =
    input.requestId
      ? (
          await db
            .select()
            .from(mpesaStkRequests)
            .where(
              and(
                eq(mpesaStkRequests.id, input.requestId),
                eq(mpesaStkRequests.businessId, user.businessId),
              ),
            )
            .limit(1)
        )[0]
      : undefined;

  if (!row && input.checkoutRequestId) {
    row = (
      await db
        .select()
        .from(mpesaStkRequests)
        .where(
          and(
            eq(mpesaStkRequests.checkoutRequestId, input.checkoutRequestId),
            eq(mpesaStkRequests.businessId, user.businessId),
          ),
        )
        .orderBy(desc(mpesaStkRequests.createdAt))
        .limit(1)
    )[0];
  }

  if (!row) {
    return { success: false as const, message: "STK request not found." };
  }

  if (row.status === "SUCCESS") {
    return {
      success: true as const,
      status: "SUCCESS" as const,
      mpesaReceipt: row.mpesaReceipt,
      resultDesc: row.resultDesc,
    };
  }
  if (row.status === "FAILED" || row.status === "CANCELLED") {
    return {
      success: true as const,
      status: row.status as "FAILED" | "CANCELLED",
      resultDesc: row.resultDesc,
    };
  }

  const [settings] = await db
    .select()
    .from(mpesaSettings)
    .where(eq(mpesaSettings.businessId, user.businessId))
    .limit(1);
  if (!settings) {
    return { success: false as const, message: "M-Pesa not configured." };
  }

  const cfg = toConfig(settings);
  try {
    const q = await stkQuery(cfg, row.checkoutRequestId || "");
    if (q.status !== "PENDING") {
      await db
        .update(mpesaStkRequests)
        .set({
          status: q.status,
          resultCode: q.resultCode || null,
          resultDesc: q.resultDesc || null,
          mpesaReceipt: q.mpesaReceipt || row.mpesaReceipt,
          updatedAt: new Date(),
        })
        .where(eq(mpesaStkRequests.id, row.id));
    }
    return {
      success: true as const,
      status: q.status,
      mpesaReceipt: q.mpesaReceipt || row.mpesaReceipt,
      resultDesc: q.resultDesc,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Query failed",
    };
  }
}

/** Lightweight flag for POS — is STK available for this business? */
export async function getMpesaPosFlagsAction() {
  try {
    const user = await requireAuthorizedUser("sales.create");
    const [row] = await db
      .select({
        enabled: mpesaSettings.enabled,
        simulationMode: mpesaSettings.simulationMode,
        shortcode: mpesaSettings.shortcode,
      })
      .from(mpesaSettings)
      .where(eq(mpesaSettings.businessId, user.businessId))
      .limit(1);
    return {
      success: true as const,
      enabled: Boolean(row?.enabled),
      simulationMode: row?.simulationMode !== false,
      shortcode: row?.shortcode || null,
    };
  } catch {
    return { success: true as const, enabled: false, simulationMode: true, shortcode: null };
  }
}
