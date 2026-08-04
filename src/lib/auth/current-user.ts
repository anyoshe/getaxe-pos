import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  console.log("SESSION:", session);
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

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return {
    ...user,
    initials,
    session,
  };
});

export type CurrentUser =
  NonNullable<
    Awaited<
      ReturnType<typeof getCurrentUser>
    >
  >;

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  return user;
}