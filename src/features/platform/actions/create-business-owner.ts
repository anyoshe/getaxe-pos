"use server";

import { createBusinessOwnerSchema } from "../schemas/create-business-owner";
import { platformUserService } from "../services/platform-user.service";
import { requirePlatformSession } from "@/lib/platform-auth/session";
import { revalidatePath } from "next/cache";

export async function createBusinessOwnerAction(formData: FormData) {
  const session = await requirePlatformSession();

  const parsed = createBusinessOwnerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
      errors: parsed.error.flatten(),
    };
  }

  try {
    const result = await platformUserService.createBusinessOwner(
      parsed.data,
      session.userId,
    );
    revalidatePath("/platform/business-owners");
    revalidatePath("/platform");
    return {
      success: true as const,
      temporaryPassword: result.temporaryPassword,
      email: result.invitation.email,
      name: result.invitation.name,
      loginUrl: result.loginUrl,
      nextStep: result.nextStep,
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to create owner",
    };
  }
}
