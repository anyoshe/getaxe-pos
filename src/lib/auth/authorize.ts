import "server-only";

import { requirePermission } from "./permissions";
import { getCurrentUser } from "./current-user";

export async function requireAuthorizedUser(
  permission: string
) {
  await requirePermission(permission);

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}