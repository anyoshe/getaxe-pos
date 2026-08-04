"use server";

import {
  businessProvisioningService,
} from "../services";

import {
  businessSetupSchema,
  type BusinessSetupInput,
} from "../schemas/business-setup-schema";

import {
  requireCurrentUser,
} from "@/lib/auth/current-user";

export async function createBusinessAction(
  input: BusinessSetupInput,
) {
  //
  // Validate input
  //

  const data =
    businessSetupSchema.parse(input);

  //
  // Current logged-in user
  //

  const currentUser =
    await requireCurrentUser();

  //
  // User already owns a business
  //

  if (currentUser.businessId) {
    throw new Error(
      "Business already exists.",
    );
  }

  //
  // Provision business
  //

  return businessProvisioningService.provision({
  ...data,

  ownerUserId: currentUser.id,
});
}