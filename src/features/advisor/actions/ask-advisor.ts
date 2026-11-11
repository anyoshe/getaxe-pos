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
