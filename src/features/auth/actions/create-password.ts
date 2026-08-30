"use server";

import { redirect } from "next/navigation";

import { createPasswordSchema } from "../schemas/create-password-schema";
import { createPasswordService } from "../services/create-password.service";
import { createOnboardingSession } from "@/lib/onboarding-auth/session";

export async function createPasswordAction(formData: FormData) {
  const parsed = createPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten(),
    };
  }

  const invitation = await createPasswordService.createPassword(
    parsed.data.email,
    parsed.data.password,
  );

  await createOnboardingSession({
    invitationId: invitation.id,
    email: invitation.email,
  });

  redirect("/setup");
}
