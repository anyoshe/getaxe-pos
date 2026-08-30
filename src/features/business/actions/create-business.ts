"use server";

import { redirect } from "next/navigation";

import { businessProvisioningService } from "../services";
import {
  businessSetupSchema,
  type BusinessSetupInput,
} from "../schemas/business-setup-schema";
import { requireOnboardingUser } from "@/lib/onboarding-auth/current-onboarding-user";
import { destroyOnboardingSession } from "@/lib/onboarding-auth/session";
import { createSession } from "@/lib/auth/session";
import { userInvitationsRepository } from "@/repositories";

export async function createBusinessAction(input: BusinessSetupInput) {
  const data = businessSetupSchema.parse(input);

  const onboardingUser = await requireOnboardingUser();

  // Fresh invitation row (password may have been set on /create-password)
  const invitation = await userInvitationsRepository.findById(
    onboardingUser.id,
  );
  if (!invitation) {
    throw new Error("Invitation not found. Sign in again.");
  }
  if (invitation.status === "COMPLETED") {
    // Already provisioned — try to log them into ERP if user exists
    redirect("/login");
  }
  if (!invitation.passwordHash) {
    throw new Error("Set your password before creating a business.");
  }

  const result = await businessProvisioningService.provision({
    ...data,
    ownerUserId: onboardingUser.createdBy,
    ownerInvitationId: invitation.id,
    ownerName: invitation.name,
    ownerEmail: invitation.email,
    ownerPhone: invitation.phone ?? undefined,
    ownerPasswordHash: invitation.passwordHash,
  });

  const ownerId = result.owner?.id;
  const adminRoleId = result.adminRoleId;
  const businessId = result.business.id;

  if (!ownerId || !adminRoleId) {
    throw new Error(
      "Business was created but the administrator account is missing. Contact support.",
    );
  }

  await destroyOnboardingSession();

  // ERP session must use the provisioned *users* row + ADMINISTRATOR role
  await createSession({
    userId: ownerId,
    businessId,
    roleId: adminRoleId,
    email: invitation.email,
  });

  redirect("/dashboard");
}
