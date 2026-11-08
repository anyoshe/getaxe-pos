"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { businessSettings } from "@/db/schema/settings/business_settings";
import { businesses } from "@/db/schema/core/businesses";
import { requireAuthorizedUser } from "@/lib/auth/authorize";

export type BelowCostPolicy = "off" | "warn" | "block";

export async function getPricingPolicyAction(): Promise<{
  belowCostSalePolicy: BelowCostPolicy;
  documentFooter: string | null;
  legalName: string | null;
  logo: string | null;
  name: string;
}> {
  const user = await requireAuthorizedUser("business.view");
  const [settings] = await db
    .select({
      belowCostSalePolicy: businessSettings.belowCostSalePolicy,
    })
    .from(businessSettings)
    .where(eq(businessSettings.businessId, user.businessId))
    .limit(1)
    .catch(() => [null]);

  const [biz] = await db
    .select({
      name: businesses.name,
      legalName: businesses.legalName,
      logo: businesses.logo,
      documentFooter: businesses.documentFooter,
    })
    .from(businesses)
    .where(eq(businesses.id, user.businessId))
    .limit(1);

  const raw = (settings?.belowCostSalePolicy ?? "block").toLowerCase();
  const policy: BelowCostPolicy =
    raw === "off" || raw === "warn" || raw === "block" ? raw : "block";

  return {
    belowCostSalePolicy: policy,
    documentFooter: biz?.documentFooter ?? null,
    legalName: biz?.legalName ?? null,
    logo: biz?.logo ?? null,
    name: biz?.name ?? "",
  };
}

export async function savePricingPolicyAction(input: {
  belowCostSalePolicy: BelowCostPolicy;
  documentFooter?: string | null;
}): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const user = await requireAuthorizedUser("business.update");
    const policy = input.belowCostSalePolicy;
    if (!["off", "warn", "block"].includes(policy)) {
      return { success: false, message: "Invalid policy." };
    }

    const existing = await db
      .select({ id: businessSettings.id })
      .from(businessSettings)
      .where(eq(businessSettings.businessId, user.businessId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(businessSettings)
        .set({
          belowCostSalePolicy: policy,
          updatedAt: new Date(),
        })
        .where(eq(businessSettings.businessId, user.businessId));
    } else {
      await db.insert(businessSettings).values({
        businessId: user.businessId,
        belowCostSalePolicy: policy,
      });
    }

    if (input.documentFooter !== undefined) {
      await db
        .update(businesses)
        .set({
          documentFooter: input.documentFooter?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, user.businessId));
    }

    revalidatePath("/settings/pricing-policy");
    revalidatePath("/sales/pos");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Save failed",
    };
  }
}

export async function getBelowCostPolicyForBusiness(
  businessId: string,
): Promise<BelowCostPolicy> {
  const [row] = await db
    .select({ p: businessSettings.belowCostSalePolicy })
    .from(businessSettings)
    .where(eq(businessSettings.businessId, businessId))
    .limit(1)
    .catch(() => [null]);
  const raw = (row?.p ?? "block").toLowerCase();
  if (raw === "off" || raw === "warn" || raw === "block") return raw;
  return "block";
}
