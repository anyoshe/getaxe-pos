"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { hasPermission } from "@/lib/auth/permissions";
import { logActivity } from "@/features/audit/services/activity-log.service";
import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { CapabilityRegistry } from "@/features/capabilities/services/capability-registry";
import { capabilitySyncService } from "@/features/capabilities/services/capability-sync.service";

/**
 * Capabilities are business configuration — owner/admin with business.view.
 * Accountants and cashiers should not manage feature packs.
 */
async function requireCapabilitiesManager() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }

  const allowed =
    (await hasPermission("business.view")) ||
    (await hasPermission("business.update")) ||
    (await hasPermission("roles.view"));

  if (!allowed) {
    return {
      user: null as null,
      denied: true as const,
      message:
        "You do not have permission to manage business capabilities. Ask an administrator.",
    };
  }

  return { user, denied: false as const, message: null };
}

export async function listCapabilitiesStateAction() {
  const auth = await requireCapabilitiesManager();
  if (auth.denied || !auth.user) {
    return {
      success: false as const,
      message: auth.message ?? "Access denied.",
      capabilities: [] as Array<{
        id: string;
        name: string;
        description: string;
        module: string;
        category: string;
        enabled: boolean;
        dependencies: string[];
      }>,
    };
  }

  await capabilitySyncService.sync().catch(() => undefined);

  const registry = new CapabilityRegistry();
  const all = registry.all();
  const enabled = await new BusinessCapabilityRepository().listEnabled(
    auth.user.businessId,
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
  const auth = await requireCapabilitiesManager();
  if (auth.denied || !auth.user) {
    return {
      success: false as const,
      message: auth.message ?? "Access denied.",
    };
  }

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
        await repo.enable(auth.user.businessId, id);
      }
    } else {
      await repo.disable(auth.user.businessId, parsed.data.capabilityId);
    }

    void logActivity({
      businessId: auth.user.businessId,
      userId: auth.user.id,
      action: "UPDATE",
      entity: "SETTING",
      description: `Capability ${parsed.data.capabilityId} ${
        parsed.data.enabled ? "enabled" : "disabled"
      }`,
    });

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
