import { eq } from "drizzle-orm";

import { db } from "@/db";
import { etimsSettings } from "@/db/schema/integrations/etims";
import { sales } from "@/db/schema/sales/sales";

export type EtimsEnvironment = "simulation" | "sandbox" | "production";

export type EtimsStampResult = {
  status: "OFF" | "SIMULATED" | "PENDING_LIVE" | "FAILED";
  cuInvoiceNumber: string | null;
  qrPayload: string | null;
  message: string;
  postedAt: Date | null;
};

function cleanPin(pin: string | null | undefined): string {
  return (pin || "").replace(/\s+/g, "").toUpperCase();
}

/**
 * Build a deterministic simulation CU invoice number (not a KRA value).
 * Format: SIM-{branchOrXX}-{yymmdd}-{saleSuffix}
 */
export function buildSimulationCuNumber(input: {
  invoiceNumber: string;
  branchId?: string | null;
  at?: Date;
}): string {
  const d = input.at ?? new Date();
  const yymmdd = [
    String(d.getFullYear()).slice(-2),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("");
  const branch = (input.branchId || "00").replace(/\W/g, "").slice(0, 6) || "00";
  const suffix = input.invoiceNumber.replace(/\W/g, "").slice(-8) || "00000000";
  return `SIM-${branch}-${yymmdd}-${suffix}`;
}

export async function getEtimsSettingsRow(businessId: string) {
  const [row] = await db
    .select()
    .from(etimsSettings)
    .where(eq(etimsSettings.businessId, businessId))
    .limit(1);
  return row ?? null;
}

/**
 * After a sale is committed: apply Phase A eTIMS behaviour.
 * - disabled → OFF (no stamp)
 * - simulation → fake CU number + QR payload on the sale row
 * - sandbox/production → PENDING_LIVE until Phase B wiring exists
 */
export async function applyEtimsPhaseAAfterSale(input: {
  businessId: string;
  saleId: string;
  invoiceNumber: string;
}): Promise<EtimsStampResult> {
  const settings = await getEtimsSettingsRow(input.businessId);

  if (!settings?.enabled) {
    return {
      status: "OFF",
      cuInvoiceNumber: null,
      qrPayload: null,
      message: "eTIMS is off for this business.",
      postedAt: null,
    };
  }

  const env = (settings.environment || "simulation") as EtimsEnvironment;

  if (env === "simulation") {
    const cu = buildSimulationCuNumber({
      invoiceNumber: input.invoiceNumber,
      branchId: settings.branchId,
    });
    const qrPayload = JSON.stringify({
      phase: "A",
      mode: "SIMULATION",
      cuInvoiceNo: cu,
      saleId: input.saleId,
      invoiceNumber: input.invoiceNumber,
      kraPin: cleanPin(settings.kraPin) || null,
      note: "Not submitted to KRA — GetAxe simulation only",
    });
    const postedAt = new Date();
    await db
      .update(sales)
      .set({
        etimsStatus: "SIMULATED",
        etimsCuInvoiceNumber: cu,
        etimsQrPayload: qrPayload,
        etimsMessage:
          "Simulation stamp only. Not a valid KRA tax invoice. Turn off simulation and complete Phase B for live eTIMS.",
        etimsPostedAt: postedAt,
        updatedAt: postedAt,
      })
      .where(eq(sales.id, input.saleId));

    return {
      status: "SIMULATED",
      cuInvoiceNumber: cu,
      qrPayload,
      message:
        "Simulation eTIMS stamp applied (not sent to KRA).",
      postedAt,
    };
  }

  // sandbox / production without Phase B client
  const message =
    env === "production"
      ? "eTIMS is ON (production) but live KRA posting is not enabled in this app version (Phase B). Sale completed without CU signature."
      : "eTIMS is ON (sandbox) but live KRA posting is not enabled in this app version (Phase B). Sale completed without CU signature.";

  const postedAt = new Date();
  await db
    .update(sales)
    .set({
      etimsStatus: "PENDING_LIVE",
      etimsCuInvoiceNumber: null,
      etimsQrPayload: null,
      etimsMessage: message,
      etimsPostedAt: postedAt,
      updatedAt: postedAt,
    })
    .where(eq(sales.id, input.saleId));

  return {
    status: "PENDING_LIVE",
    cuInvoiceNumber: null,
    qrPayload: null,
    message,
    postedAt,
  };
}
