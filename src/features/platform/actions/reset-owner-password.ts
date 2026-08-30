"use server";

import { platformUserService } from "../services/platform-user.service";
import { requirePlatformSession } from "@/lib/platform-auth/session";
import { revalidatePath } from "next/cache";

export async function resetOwnerPasswordAction(invitationId: string) {
  await requirePlatformSession();
  try {
    const result =
      await platformUserService.resetTemporaryPassword(invitationId);
    revalidatePath("/platform/business-owners");
    return { success: true as const, ...result };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Reset failed",
    };
  }
}
