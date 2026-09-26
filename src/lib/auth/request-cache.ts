import { cache } from "react";

import { BusinessCapabilityRepository } from "@/features/capabilities/repositories";
import { rolePermissionService } from "@/services/security/role-permission.service";

/** One capabilities fetch per request (layout + pages share this). */
export const getEnabledCapabilitiesCached = cache(async (businessId: string) => {
  return new BusinessCapabilityRepository()
    .listEnabled(businessId)
    .catch(() => [] as string[]);
});

/** One permissions fetch per request. */
export const getUserPermissionCodesCached = cache(async (userId: string) => {
  const perms = await rolePermissionService.getUserPermissions(userId);
  return perms.map((p) => p.code);
});
