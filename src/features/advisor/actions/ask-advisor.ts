"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  askBusinessAdvisor,
  getAdvisorRemaining,
} from "../services/advisor.service";

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
