import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (process.env.NODE_ENV === "development") {
    console.log(
      "SESSION:",
      session
        ? { userId: session.userId, businessId: session.businessId }
        : null,
    );
  }
  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    with: {
      role: true,
      business: true,
    },
  });

  if (!user || !user.active) {
    return null;
  }

  // Session business must match the user row — prevents cross-tenant bleed
  // if JWT and DB ever diverge.
  if (user.businessId !== session.businessId) {
    console.error(
      "Session businessId mismatch; forcing re-login",
      session.userId,
      session.businessId,
      user.businessId,
    );
    return null;
  }

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return {
    ...user,
    businessId: session.businessId,
    initials,
    session,
  };
});

export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  return user;
}
