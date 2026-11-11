"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  askBusinessAdvisor,
  getAdvisorRemaining,
} from "../services/advisor.service";
import { buildBusinessAdvisorContext } from "../services/business-context.service";
import {
  setupWelcomeActions,
  setupWelcomeMessage,
} from "../services/setup-coach";
import { applyVerticalPackAction } from "@/features/settings/actions/apply-vertical-pack";
import type { GoLiveVertical } from "@/features/settings/lib/go-live-day";

export async function askAdvisorAction(question: string) {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return {
      success: false as const,
      message: "Business not provisioned.",
    };
  }
  try {
    const reply = await askBusinessAdvisor(user.businessId, question);
    return { success: true as const, data: reply };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Advisor failed",
    };
  }
}

export async function getAdvisorQuotaAction() {
  const user = await requireCurrentUser();
  if (!user.businessId) return { remainingToday: 0 };
  return { remainingToday: getAdvisorRemaining(user.businessId) };
}

/** Phase A: welcome snapshot when chat opens (no quota consume). */
export async function getAdvisorSetupWelcomeAction() {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  try {
    const ctx = await buildBusinessAdvisorContext(user.businessId);
    const actions = setupWelcomeActions(ctx.setup).map((a) => ({
      label: a.label,
      href: a.href,
      applyVertical: a.applyVertical,
    }));
    return {
      success: true as const,
      data: {
        answer: setupWelcomeMessage(ctx.setup),
        setup: ctx.setup,
        actions,
        remainingToday: getAdvisorRemaining(user.businessId),
      },
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not load setup status",
    };
  }
}

/** Phase A: confirm → apply vertical pack via existing trusted action. */
export async function applyAdvisorVerticalPackAction(
  vertical: GoLiveVertical,
  loadStarters = true,
) {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  const result = await applyVerticalPackAction({
    vertical,
    loadStarters,
  });
  if (!result.success) {
    return {
      success: false as const,
      message: result.message ?? "Could not apply vertical pack",
    };
  }
  // Refresh coaching text after pack
  const ctx = await buildBusinessAdvisorContext(user.businessId).catch(() => null);
  return {
    success: true as const,
    message: result.message,
    nextAnswer: ctx
      ? setupWelcomeMessage(ctx.setup)
      : "Defaults applied. Open Go live in 1 day for the remaining checklist.",
    actions: ctx
      ? setupWelcomeActions(ctx.setup).map((a) => ({
          label: a.label,
          href: a.href,
          applyVertical: a.applyVertical,
        }))
      : [{ label: "Go live in 1 day", href: "/settings/go-live" }],
  };
}

/** Phase B: daily or weekly owner brief (consumes one advisor message). */
export async function getAdvisorOwnerBriefAction(
  period: "daily" | "weekly" = "daily",
) {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  try {
    const reply = await askBusinessAdvisor(
      user.businessId,
      period === "weekly" ? "weekly brief" : "daily brief",
    );
    return { success: true as const, data: reply };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Brief failed",
    };
  }
}

/** Phase C: confirm → create DRAFT PO(s) from current restock list. */
export async function createAdvisorRestockPoAction() {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  try {
    const { createRestockDraftPurchaseOrders } = await import(
      "../services/restock-po-draft"
    );
    const result = await createRestockDraftPurchaseOrders(user.businessId);
    if (!result.success) {
      return { success: false as const, message: result.message };
    }
    return {
      success: true as const,
      message: result.message,
      orderNumbers: result.orderNumbers,
      orderIds: result.orderIds,
      actions: [
        { label: "Purchase orders", href: "/purchases/orders" },
        { label: "Restock list", href: "/dashboard/attention?kind=restock" },
        { label: "Receiving", href: "/purchases/receiving" },
      ],
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not create PO",
    };
  }
}

/** Phase D: confirm paste draft → bulk product create. */
export async function createAdvisorProductsFromPasteAction(input: {
  categoryId: string;
  lines: Array<{
    name: string;
    sku?: string | null;
    barcode?: string | null;
    costPrice?: number | null;
    sellingPrice?: number | null;
    productType?: string;
  }>;
}) {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  if (!input?.categoryId || !Array.isArray(input.lines) || input.lines.length === 0) {
    return {
      success: false as const,
      message: "Nothing to create — paste a product list first.",
    };
  }
  try {
    const { toBatchCreateItems } = await import("../services/product-paste-draft");
    const { createProductsBatchAction } = await import(
      "@/features/inventory/actions/create-products-batch"
    );
    const items = toBatchCreateItems(
      input.lines.map((l) => ({
        name: l.name,
        sku: l.sku ?? null,
        barcode: l.barcode ?? null,
        costPrice: l.costPrice ?? null,
        sellingPrice: l.sellingPrice ?? null,
        productType: (l.productType as "physical") || "physical",
      })),
      input.categoryId,
    );
    const result = await createProductsBatchAction(items);
    const baseMsg = result.message || "";
    const nudge =
      result.success
        ? "\n\n**Next:** post **opening stock** so POS can sell these items (products start at zero quantity)."
        : "";
    return {
      success: result.success,
      message: baseMsg + nudge,
      actions: [
        { label: "Post opening stock", href: "/inventory/stock/receive" },
        { label: "Products", href: "/inventory/products" },
        { label: "Starter kits", href: "/inventory/starter-kits" },
      ],
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Could not create products",
    };
  }
}

/** Phase H: photo → OCR → product draft (same create path as paste). */
export async function extractAdvisorProductsFromImageAction(input: {
  dataUrl: string;
}) {
  const user = await requireCurrentUser();
  if (!user.businessId) {
    return { success: false as const, message: "Business not provisioned." };
  }
  if (!input?.dataUrl || input.dataUrl.length < 32) {
    return { success: false as const, message: "No image received." };
  }
  try {
    const { extractProductDraftFromImage } = await import(
      "../services/product-ocr"
    );
    const result = await extractProductDraftFromImage({
      businessId: user.businessId,
      dataUrl: input.dataUrl,
    });
    if (!result.success || !result.draft) {
      return {
        success: false as const,
        message: result.message,
        rawText: result.rawText,
      };
    }
    return {
      success: true as const,
      message: result.message,
      productDraft: result.draft.lines,
      productDraftCategoryId: result.draft.categoryId ?? undefined,
      actions: (
        await import("../services/product-ocr")
      ).productOcrActions(result.draft),
      rawText: result.rawText,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "OCR failed",
    };
  }
}
