"use server";

import { requirePlatformSession } from "@/lib/platform-auth/session";
import { businessRepository } from "@/repositories/core/business.repository";

export async function getBusinessesAction() {
  await requirePlatformSession();
  const rows = await businessRepository.findAll();
  return {
    success: true as const,
    data: rows.map((b) => ({
      id: b.id,
      name: b.name,
      businessType: (b as { businessType?: string }).businessType ?? "—",
      email: b.email,
      phone: b.phone,
      active: b.active !== false,
      currency: (b as { currency?: string }).currency ?? "KES",
      createdAt: b.createdAt,
    })),
  };
}
