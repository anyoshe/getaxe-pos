import "server-only";

import { cache } from "react";

import { getPlatformSession } from "./session";

import {
  platformUserRepository,
} from "@/repositories";

export const getCurrentPlatformUser = cache(
  async () => {

    const session =
      await getPlatformSession();

    if (!session) {
      return null;
    }

    const user =
      await platformUserRepository.findById(
        session.userId,
      );

    if (!user || !user.active) {
      return null;
    }

    return {
      ...user,
      session,
    };
  },
);

export async function requirePlatformUser() {

  const user =
    await getCurrentPlatformUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  return user;

}