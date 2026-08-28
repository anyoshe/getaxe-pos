"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { CapabilityRegistry } from "@/features/capabilities/services/capability-registry";
import { capabilitySyncService } from "@/features/capabilities/services/capability-sync.service";

export async function listCapabilitiesStateAction() {
  const user = await requireAuthorizedUser("business.view");
  await capabilitySyncService.sync().catch(() => undefined);

  const registry = new CapabilityRegistry();
  const all = registry.all();
  const enabled = await new BusinessCapabilityRepository().listEnabled(
    user.businessId,
  );
  const enabledSet = new Set(enabled);

  return {
    success: true as const,
    capabilities: all.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      module: String(c.module),
      category: String(c.category),
      enabled: enabledSet.has(c.id),
    })),
  };
}

export async function setCapabilityEnabledAction(input: unknown) {
  const user = await requireAuthorizedUser("business.view");
  const parsed = z
    .object({
      capabilityId: z.string().min(1),
      enabled: z.boolean(),
    })
    .safeParse(input);

  if (!parsed.success) {
    return { success: false as const, message: "Invalid capability." };
  }

  try {
    const repo = new BusinessCapabilityRepository();
    if (parsed.data.enabled) {
      await repo.enable(user.businessId, parsed.data.capabilityId);
    } else {
      await repo.disable(user.businessId, parsed.data.capabilityId);
    }

    void logActivity({
      businessId: user.businessId,
      userId: user.id,
      action: "UPDATE",
      entity: "SETTING",
      description: `Capability ${parsed.data.capabilityId} ${
        parsed.data.enabled ? "enabled" : "disabled"
      }`,
    });

    revalidatePath("/settings/capabilities");
    revalidatePath("/inventory/products");
    revalidatePath("/sales/pos");
    return {
      success: true as const,
      message: parsed.data.enabled
        ? "Capability enabled."
        : "Capability disabled.",
    };
  } catch (e) {
    return {
      success: false as const,
      message:
        e instanceof Error
          ? e.message
          : "Failed to update capability. Try pnpm db:sync-capabilities.",
    };
  }
}
