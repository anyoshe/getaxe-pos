import "server-only";

import { redirect } from "next/navigation";

import { requirePermission, hasPermission } from "./permissions";
import { getCurrentUser } from "./current-user";

export async function requireAuthorizedUser(permission: string) {
  await requirePermission(permission);

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Server pages: require login + permission, else soft redirect (no stack dump).
 * Use for dashboard/POS routes so cashiers cannot open admin URLs by path.
 */
export async function requirePageAccess(permission: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const ok = await hasPermission(permission).catch(() => false);
  if (!ok) {
    redirect("/dashboard?error=forbidden");
  }

  return user;
}

/** Any of the listed permissions is enough (e.g. view OR manage). */
export async function requirePageAccessAny(permissions: string[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  for (const p of permissions) {
    if (await hasPermission(p).catch(() => false)) {
      return user;
    }
  }
  redirect("/dashboard?error=forbidden");
}
