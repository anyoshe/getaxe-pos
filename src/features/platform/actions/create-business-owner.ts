"use server";

import {
  createBusinessOwnerSchema,
} from "../schemas/create-business-owner";

import {
  platformUserService,
} from "../services/platform-user.service";

import {
  requirePlatformSession,
} from "@/lib/platform-auth/session";


export async function createBusinessOwnerAction(
  formData: FormData,
) {

  const session =
    await requirePlatformSession();


  const parsed =
    createBusinessOwnerSchema.safeParse({

      name: formData.get("name"),

      email: formData.get("email"),

      phone: formData.get("phone"),

    });


  if (!parsed.success) {

    return {
      success:false,
      errors: parsed.error.flatten(),
    };

  }


  await platformUserService.createBusinessOwner(
    parsed.data,
    session.userId,
  );


  return {
    success:true,
  };

}