import "server-only";

import type { SessionPayload } from "./jwt";

import { signJwt, verifyJwt } from "./jwt";

import {
  setSessionCookie,
  getSessionCookie,
  deleteSessionCookie,
} from "./cookies";

export async function createSession(
  payload: SessionPayload
) {
  const token = await signJwt(payload);

  await setSessionCookie(token);
}

export async function getSession() {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  try {
    return await verifyJwt(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthenticated");
  }

  return session;
}

export async function destroySession() {
  await deleteSessionCookie();
}