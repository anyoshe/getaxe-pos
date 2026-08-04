import "server-only";

import { cookies } from "next/headers";

const PLATFORM_SESSION_COOKIE = "getaxe-platform-session";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function setPlatformSessionCookie(
  token: string,
) {
  const cookieStore = await cookies();

  cookieStore.set(
    PLATFORM_SESSION_COOKIE,
    token,
    COOKIE_OPTIONS,
  );
}

export async function getPlatformSessionCookie() {
  const cookieStore = await cookies();

  return (
    cookieStore.get(
      PLATFORM_SESSION_COOKIE,
    )?.value ?? null
  );
}

export async function deletePlatformSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(
    PLATFORM_SESSION_COOKIE,
  );
}