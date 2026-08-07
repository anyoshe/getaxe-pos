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

  //
  // Validate input
  //

  const data =
    businessSetupSchema.parse(input);

  //
  // Current onboarding user
  //

  const onboardingUser =
    await requireOnboardingUser();

  //
  // Provision business
  //

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

  //
  // Onboarding finished
  //

  await destroyOnboardingSession();

  //
  // Create ERP session
  //

  await createSession({

    userId:
      business.createdBy!,

    businessId:
      business.id,

    roleId:
      (
        await requireOnboardingUser()
      ).roleId,

    email:
      onboardingUser.email,

  });

  //
  // Go to Dashboard
  //

  redirect("/dashboard");

}