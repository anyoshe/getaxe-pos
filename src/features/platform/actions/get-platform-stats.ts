"use server";

import { requirePlatformSession } from "@/lib/platform-auth/session";
import { userInvitationsRepository } from "@/repositories";
import { businessRepository } from "@/repositories/core/business.repository";

export async function getPlatformStatsAction() {
  await requirePlatformSession();
  const [invites, businesses] = await Promise.all([
    userInvitationsRepository.findAll(),
    businessRepository.findAll(),
  ]);
  const pending = invites.filter((i) => i.status !== "COMPLETED").length;
  const completed = invites.filter((i) => i.status === "COMPLETED").length;
  const activeBiz = businesses.filter((b) => b.active !== false).length;
  return {
    success: true as const,
    owners: invites.length,
    businesses: businesses.length,
    activeBusinesses: activeBiz,
    pendingSetup: pending,
    completedOwners: completed,
  };
}
