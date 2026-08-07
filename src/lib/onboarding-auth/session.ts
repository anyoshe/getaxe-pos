import "server-only";

import { cookies } from "next/headers";

import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "getaxe-onboarding-session";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET!,
);

export type OnboardingSessionPayload = {
  invitationId: string;
  email: string;
};

export async function createOnboardingSession(
  payload: OnboardingSessionPayload,
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function getOnboardingSession() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(token, secret);

    return payload as OnboardingSessionPayload;
  } catch {
    return null;
  }
}

export async function destroyOnboardingSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}