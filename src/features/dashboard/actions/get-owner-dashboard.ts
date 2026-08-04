"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";

import { dashboardService } from "../services";

export async function getOwnerDashboardAction() {

  const user =
    await requireCurrentUser();

  if (!user.businessId) {
    throw new Error(
      "Business has not been provisioned.",
    );
  }

  return dashboardService.getOwnerDashboard(
    user.businessId,
  );

}