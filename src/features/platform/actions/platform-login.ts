"use server";

import { redirect } from "next/navigation";

import {
  createPlatformSession,
} from "@/lib/platform-auth/session";

import {
  platformAuthService,
} from "../services/platform-auth.service";

export type PlatformLoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function platformLogin(
  email: string,
  password: string,
): Promise<PlatformLoginResult> {

  const user =
    await platformAuthService.authenticate(
      email,
      password,
    );

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password.",
    };
  }

  if (user.role !== "SUPER_ADMIN") {
    return {
      success: false,
      message: "Access denied.",
    };
  }

  await createPlatformSession({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  redirect("/platform");
}