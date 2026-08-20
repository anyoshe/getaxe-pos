"use server";

import { redirect } from "next/navigation";

import {
  businessProvisioningService,
} from "../services";

import {
  businessSetupSchema,
  type BusinessSetupInput,
} from "../schemas/business-setup-schema";

import {
  requireOnboardingUser,
} from "@/lib/onboarding-auth/current-onboarding-user";

import {
  destroyOnboardingSession,
} from "@/lib/onboarding-auth/session";

import {
  createSession,
} from "@/lib/auth/session";

export async function createBusinessAction(
  input: BusinessSetupInput,
) {
  const data =
    businessSetupSchema.parse(input);

  // Must read session BEFORE destroying it
  const onboardingUser =
    await requireOnboardingUser();

  const roleId = onboardingUser.roleId;

  const business =
    await businessProvisioningService.provision({
      ...data,
      ownerUserId:
        onboardingUser.createdBy,
      ownerInvitationId:
        onboardingUser.id,
      ownerName:
        onboardingUser.name,
      ownerEmail:
        onboardingUser.email,
      ownerPhone:
        onboardingUser.phone ?? undefined,
      ownerPasswordHash:
        onboardingUser.passwordHash!,
    });

  // Prefer the provisioned owner user id when available
  const sessionUserId =
    business.createdBy ??
    onboardingUser.createdBy;

  if (!sessionUserId) {
    throw new Error(
      "Business provisioned but owner user id is missing.",
    );
  }

  if (!roleId) {
    throw new Error(
      "Onboarding invitation is missing a role id.",
    );
  }

  // End onboarding session only after we have everything we need
  await destroyOnboardingSession();

  await createSession({
    userId: sessionUserId,
    businessId: business.id,
    roleId,
    email: onboardingUser.email,
  });

  redirect("/dashboard");
}
