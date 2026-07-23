"use server";

import { redirect } from "next/navigation";

import { authenticateUser } from "../services/auth-service";
import type { LoginInput } from "../schemas/login-schema";

import { createSession } from "@/lib/auth/session";

export type LoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function login(
  credentials: LoginInput
): Promise<LoginResult> {
  const user = await authenticateUser(credentials);

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  await createSession({
    userId: user.id,
    businessId: user.businessId,
    roleId: user.roleId,
    email: user.email,
  });

  /**
   * redirect() throws a NEXT_REDIRECT response.
   * The line below satisfies TypeScript but is never reached.
   */
  redirect("/dashboard");

  return {
    success: true,
  };
}