"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuthorizedUser } from "@/lib/auth/authorize";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { CapabilityRegistry } from "@/features/capabilities/services/capability-registry";
import { capabilitySyncService } from "@/features/capabilities/services/capability-sync.service";

async function requireUserLoose() {
  // Prefer business.view; fall back to any authenticated dashboard user
  try {
    return await requireAuthorizedUser("business.view");
  } catch {
    return await requireAuthorizedUser("products.view");
  }
}

export async function listCapabilitiesStateAction() {
  const user = await requireUserLoose();
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
      dependencies: c.dependencies ?? [],
    })),
  };
}

export async function setCapabilityEnabledAction(input: unknown) {
  const user = await requireUserLoose();
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
    await capabilitySyncService.sync().catch(() => undefined);
    const repo = new BusinessCapabilityRepository();
    const registry = new CapabilityRegistry();

    if (parsed.data.enabled) {
      // Enable dependency chain first (catalogue dependencies)
      const toEnable: string[] = [];
      const visit = (id: string) => {
        if (toEnable.includes(id)) return;
        const def = registry.get(id);
        if (def?.dependencies?.length) {
          for (const dep of def.dependencies) visit(dep);
        }
        toEnable.push(id);
      };
      visit(parsed.data.capabilityId);

      for (const id of toEnable) {
        await repo.enable(user.businessId, id);
      }
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

    // Refresh every surface that resolves product rules / POS behaviour
    for (const path of [
      "/settings/capabilities",
      "/inventory/products",
      "/inventory/stock",
      "/inventory/stock/receive",
      "/sales/pos",
      "/purchases/receiving",
      "/dashboard",
    ]) {
      revalidatePath(path);
    }

    return {
      success: true as const,
      message: parsed.data.enabled
        ? "Capability enabled (including required dependencies)."
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
