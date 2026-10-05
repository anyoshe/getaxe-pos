"use server";

import { and, eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema/users/users";
import { roles } from "@/db/schema/users/roles";
import { businesses } from "@/db/schema/core/businesses";
import { createSession } from "@/lib/auth/session";
import { requirePlatformSession } from "@/lib/platform-auth/session";
import { logActivity } from "@/features/audit/services/activity-log.service";

/**
 * Prefer an active ADMINISTRATOR / BUSINESS_OWNER user for the tenant.
 * Falls back to any active user so support can still open incomplete setups.
 */
async function findSupportTargetUser(businessId: string) {
  const withAdminRole = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      roleId: users.roleId,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(
      and(eq(users.businessId, businessId), eq(users.active, true)),
    )
    .orderBy(desc(users.createdAt));

  if (withAdminRole.length === 0) return null;

  const preferred = withAdminRole.find((u) => {
    const n = (u.roleName ?? "").toUpperCase();
    return (
      n.includes("ADMIN") ||
      n.includes("OWNER") ||
      n === "BUSINESS_OWNER" ||
      n === "ADMINISTRATOR"
    );
  });

  return preferred ?? withAdminRole[0]!;
}

/**
 * Platform super-admin opens a tenant session for guided support.
 * Does not replace the platform session cookie — both can coexist.
 */
export async function enterBusinessSupportAccessAction(businessId: string) {
  const platform = await requirePlatformSession();

  const business = await db.query.businesses.findFirst({
    where: eq(businesses.id, businessId),
  });

  if (!business) {
    return { success: false as const, message: "Business not found." };
  }

  if (business.active === false) {
    return {
      success: false as const,
      message: "Business is inactive. Reactivate before support access.",
    };
  }

  const target = await findSupportTargetUser(businessId);
  if (!target) {
    return {
      success: false as const,
      message:
        "No active user in this business yet. Ask the owner to finish setup or invite a user first.",
    };
  }

  await createSession({
    userId: target.id,
    businessId,
    roleId: target.roleId,
    email: target.email,
    supportAccess: true,
    platformUserId: platform.userId,
    platformUserEmail: platform.email,
  });

  try {
    await logActivity({
      businessId,
      userId: target.id,
      action: "LOGIN",
      entity: "BUSINESS",
      entityId: businessId,
      description: `Platform support access by ${platform.email} acting as ${target.email} (${business.name})`,
    });
  } catch {
    /* non-fatal */
  }

  redirect("/dashboard");
}

/** Leave tenant support session and return to platform (tenant cookie cleared by caller optionally). */
export async function exitSupportAccessAction() {
  const { destroySession } = await import("@/lib/auth/session");
  await destroySession();
  redirect("/platform/businesses");
}
