import "server-only";

import { cache } from "react";

import {
  getOnboardingSession,
} from "./session";

import {
  userInvitationsRepository,
} from "@/repositories";

export const getCurrentOnboardingUser =
  cache(async () => {

    const session =
      await getOnboardingSession();

    if (!session) {
      return null;
    }

    const invitation =
      await userInvitationsRepository.findById(
        session.invitationId,
      );

    if (!invitation) {
      return null;
    }

    return {
      ...invitation,
      session,
    };
  });

export async function requireOnboardingUser() {

  const user =
    await getCurrentOnboardingUser();

  if (!user) {
    throw new Error("Unauthenticated");
  }

  return user;
}