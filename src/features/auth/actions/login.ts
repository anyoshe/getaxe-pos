"use server";

import { redirect } from "next/navigation";

import { authenticateUser } from "../services/auth-service";

import { createSession } from "@/lib/auth/session";

import type { LoginInput } from "../schemas/login-schema";

export async function login(
  credentials: LoginInput
) {
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

  redirect("/dashboard");
}