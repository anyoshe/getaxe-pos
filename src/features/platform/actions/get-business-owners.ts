"use server";

import { platformUserService } from "../services/platform-user.service";
import { requirePlatformSession } from "@/lib/platform-auth/session";

export async function getBusinessOwnersAction() {
  await requirePlatformSession();
  const rows = await platformUserService.listInvitations();
  return {
    success: true as const,
    data: rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      status: r.status,
      active: r.status !== "CANCELLED",
      role: "BUSINESS_OWNER",
      createdAt: r.createdAt,
      hasPassword: Boolean(r.passwordHash),
    })),
  };
}
