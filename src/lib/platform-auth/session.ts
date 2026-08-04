import "server-only";

import type {
  PlatformSessionPayload,
} from "./jwt";

import {
  signPlatformJwt,
  verifyPlatformJwt,
} from "./jwt";

import {
  setPlatformSessionCookie,
  getPlatformSessionCookie,
  deletePlatformSessionCookie,
} from "./cookies";

export async function createPlatformSession(
  payload: PlatformSessionPayload,
) {
  const token =
    await signPlatformJwt(payload);

  await setPlatformSessionCookie(
    token,
  );
}

export async function getPlatformSession() {
  const token =
    await getPlatformSessionCookie();

  if (!token) {
    return null;
  }

  try {
    return await verifyPlatformJwt(
      token,
    );
  } catch {
    return null;
  }
}

export async function requirePlatformSession() {
  const session = await getPlatformSession();

  if (!session) {
    throw new Error("Unauthenticated");
  }

  return session;
}

export async function destroyPlatformSession() {
  await deletePlatformSessionCookie();
}